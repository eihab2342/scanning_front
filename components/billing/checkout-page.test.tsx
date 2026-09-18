import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutPage } from "./checkout-page";
import { renderWithQueryClient } from "@/test/test-utils";
import { makePlan, makeSubscription } from "@/test/fixtures";

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({ user: { userId: "user-1", organizationId: "org-1", role: "owner" }, accessToken: "token", isInitializing: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
}));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock("@/lib/browser", () => ({ redirectTo: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockReplace, mockSearchParams } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockSearchParams: { current: new URLSearchParams("planId=plan-2&interval=monthly") },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace, back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/billing/checkout",
  useSearchParams: () => mockSearchParams.current,
}));

import { apiFetch } from "@/lib/api/client";
import { redirectTo } from "@/lib/browser";
const mockedApiFetch = vi.mocked(apiFetch);
const mockedRedirectTo = vi.mocked(redirectTo);

function stubRoutes() {
  const subscription = makeSubscription({ hasBillingAccount: false });
  const plans = [makePlan({ id: "plan-1" }), makePlan({ id: "plan-2", name: "Enterprise", monthlyPriceCents: 9900 })];

  mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
    if (path === "/subscriptions/me") return Promise.resolve(subscription);
    if (path === "/plans") return Promise.resolve(plans);
    if (path === "/billing/kashier/checkout-session" && options?.method === "POST") return Promise.resolve({ url: "https://payments.kashier.io/session/x" });
    if (path === "/billing/cash-payments" && options?.method === "POST") return Promise.resolve({ id: "cash-1", status: "pending" });
    throw new Error(`unexpected path ${path}`);
  });
}

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockedRedirectTo.mockReset();
  mockReplace.mockReset();
  mockSearchParams.current = new URLSearchParams("planId=plan-2&interval=monthly");
});

describe("CheckoutPage", () => {
  it("shows an order summary for the selected plan", async () => {
    stubRoutes();
    renderWithQueryClient(<CheckoutPage />);

    expect(await screen.findByText("Enterprise")).toBeInTheDocument();
    expect(screen.getByText("$99.00")).toBeInTheDocument();
    expect(screen.getByText(/100 scans/i)).toBeInTheDocument();
  });

  it("paying with Kashier starts a checkout session for the selected plan/interval and redirects", async () => {
    const user = userEvent.setup();
    stubRoutes();
    renderWithQueryClient(<CheckoutPage />);

    await screen.findByText("Enterprise");
    await user.click(screen.getByRole("button", { name: /pay .*with kashier/i }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path]) => path === "/billing/kashier/checkout-session");
      expect(call).toBeDefined();
      expect(JSON.parse((call![1] as RequestInit).body as string)).toMatchObject({ planId: "plan-2", billingInterval: "monthly" });
    });
    expect(mockedRedirectTo).toHaveBeenCalledWith("https://payments.kashier.io/session/x");
  });

  it("cash fallback: submitting a cash-payment request posts it and returns to /billing", async () => {
    const user = userEvent.setup();
    stubRoutes();
    renderWithQueryClient(<CheckoutPage />);

    await screen.findByText("Enterprise");
    await user.click(screen.getByRole("button", { name: /prefer to pay by bank transfer/i }));
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path]) => path === "/billing/cash-payments");
      expect(call).toBeDefined();
      expect(JSON.parse((call![1] as RequestInit).body as string)).toMatchObject({ planId: "plan-2", billingInterval: "monthly" });
    });
    expect(mockReplace).toHaveBeenCalledWith("/billing");
  });

  it("bounces back to /billing when the plan id in the URL doesn't match any known plan", async () => {
    mockSearchParams.current = new URLSearchParams("planId=does-not-exist&interval=monthly");
    stubRoutes();
    renderWithQueryClient(<CheckoutPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/billing"));
  });
});
