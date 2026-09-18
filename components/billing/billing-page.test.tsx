import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BillingPage } from "./billing-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeOverview, makePlan, makeSubscription } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/api/types";

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({ user: { userId: "user-1", organizationId: "org-1", role: "owner" }, accessToken: "token", isInitializing: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
}));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock("@/lib/browser", () => ({ redirectTo: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/billing",
  useSearchParams: () => new URLSearchParams(),
}));

import { apiFetch } from "@/lib/api/client";
import { redirectTo } from "@/lib/browser";
const mockedApiFetch = vi.mocked(apiFetch);
const mockedRedirectTo = vi.mocked(redirectTo);

function stubRoutes(overrides: {
  subscription?: ReturnType<typeof makeSubscription>;
  plans?: ReturnType<typeof makePlan>[];
} = {}) {
  const subscription = overrides.subscription ?? makeSubscription();
  const plans = overrides.plans ?? [makePlan({ id: "plan-1" }), makePlan({ id: "plan-2", name: "Enterprise", monthlyPriceCents: 9900 })];

  mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
    if (path === "/subscriptions/me") return Promise.resolve(subscription);
    if (path === "/plans") return Promise.resolve(plans);
    if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
    if (path === "/billing/cash-payments" && !options?.method) return Promise.resolve([]);
    if (path === "/billing/cash-payments" && options?.method === "POST") return Promise.resolve({ id: "cash-1", status: "pending" });
    if (path === "/billing/portal" && options?.method === "POST") return Promise.resolve({ url: "https://billing.stripe.com/p" });
    if (path === "/billing/change-plan" && options?.method === "POST") return Promise.resolve({ requested: true });
    if (path === "/billing/cancel" && options?.method === "POST") return Promise.resolve({ ...subscription, cancelAtPeriodEnd: true });
    if (path === "/billing/reactivate" && options?.method === "POST") return Promise.resolve({ ...subscription, cancelAtPeriodEnd: false });
    throw new Error(`unexpected path ${path}`);
  });
}

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockedRedirectTo.mockReset();
  mockPush.mockReset();
  mockPermissions([...PERMISSIONS], "owner");
});

describe("BillingPage", () => {
  it("renders the current plan and available plans", async () => {
    stubRoutes();
    renderWithQueryClient(<BillingPage />);

    expect((await screen.findAllByText("Pro")).length).toBeGreaterThan(0);
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
    expect(screen.getAllByText("Current plan").length).toBeGreaterThan(0);
  });

  it("checkout: choosing a different plan with no existing billing account navigates to the checkout (order review + payment) page", async () => {
    const user = userEvent.setup();
    stubRoutes({ subscription: makeSubscription({ hasBillingAccount: false }) });
    renderWithQueryClient(<BillingPage />);

    await screen.findByText("Enterprise");
    await user.click(screen.getByRole("button", { name: /choose plan/i }));

    expect(mockPush).toHaveBeenCalledWith("/billing/checkout?planId=plan-2&interval=monthly");
  });

  it("change-plan: an existing Stripe-backed subscription requires confirmation before calling change-plan", async () => {
    const user = userEvent.setup();
    stubRoutes({ subscription: makeSubscription({ hasBillingAccount: true }) });
    renderWithQueryClient(<BillingPage />);

    await screen.findByText("Enterprise");
    await user.click(screen.getByRole("button", { name: /choose plan/i }));

    expect(await screen.findByText(/change plan to enterprise/i)).toBeInTheDocument();
    expect(mockedApiFetch.mock.calls.some(([path]) => path === "/billing/change-plan")).toBe(false);

    await user.click(screen.getByRole("button", { name: /confirm change/i }));
    await waitFor(() => {
      expect(mockedApiFetch.mock.calls.some(([path]) => path === "/billing/change-plan")).toBe(true);
    });
    expect(mockedRedirectTo).not.toHaveBeenCalled();
  });

  it("Manage Billing (portal) is hidden without billing.portal, shown and functional with it", async () => {
    mockPermissions(["dashboard.view", "billing.view"], "owner");
    stubRoutes();
    renderWithQueryClient(<BillingPage />);
    await screen.findByText("Enterprise");
    expect(screen.queryByRole("button", { name: /manage billing/i })).not.toBeInTheDocument();

    mockPermissions([...PERMISSIONS], "owner");
    const user = userEvent.setup();
    renderWithQueryClient(<BillingPage />);
    await user.click(await screen.findByRole("button", { name: /manage billing/i }));
    await waitFor(() => expect(mockedRedirectTo).toHaveBeenCalledWith("https://billing.stripe.com/p"));
  });

  it("cancel: shown with billing.cancel, requires confirmation, and calls the cancel endpoint", async () => {
    const user = userEvent.setup();
    stubRoutes({ subscription: makeSubscription({ hasBillingAccount: true, cancelAtPeriodEnd: false }) });
    renderWithQueryClient(<BillingPage />);

    await user.click(await screen.findByRole("button", { name: /cancel subscription/i }));
    await user.click(screen.getByRole("button", { name: "Cancel subscription" }));

    await waitFor(() => {
      expect(mockedApiFetch.mock.calls.some(([path]) => path === "/billing/cancel")).toBe(true);
    });
  });

  it("reactivate: shown only when cancelAtPeriodEnd is true", async () => {
    const user = userEvent.setup();
    stubRoutes({ subscription: makeSubscription({ hasBillingAccount: true, cancelAtPeriodEnd: true }) });
    renderWithQueryClient(<BillingPage />);

    const reactivateButton = await screen.findByRole("button", { name: /reactivate subscription/i });
    await user.click(reactivateButton);

    await waitFor(() => {
      expect(mockedApiFetch.mock.calls.some(([path]) => path === "/billing/reactivate")).toBe(true);
    });
  });

  it("permission-restricted: Choose Plan is hidden for a member without billing.checkout/billing.change_plan", async () => {
    mockPermissions(["dashboard.view", "billing.view"], "member");
    stubRoutes({ subscription: makeSubscription({ hasBillingAccount: false }) });
    renderWithQueryClient(<BillingPage />);

    await screen.findByText("Enterprise");
    expect(screen.queryByRole("button", { name: /choose plan/i })).not.toBeInTheDocument();
  });

  it("surfaces a backend 403 safely via the standard error state", async () => {
    mockedApiFetch.mockRejectedValue(new ApiError(403, "You don't have permission to do that."));
    renderWithQueryClient(<BillingPage />);
    expect(await screen.findByText("You don't have permission to do that.")).toBeInTheDocument();
  });
});
