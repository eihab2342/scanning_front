import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetDetailPage } from "./asset-detail-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeAsset } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/api/types";

vi.mock("@/lib/auth/auth-context", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});

import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api/client";

const mockedUseAuth = vi.mocked(useAuth);
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockedUseAuth.mockReturnValue({
    user: { userId: "user-1", organizationId: "org-1", role: "owner" },
    accessToken: "token",
    isInitializing: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  });
  mockPermissions([...PERMISSIONS], "owner");
});

describe("AssetDetailPage", () => {
  it("a pending asset shows the verification action", async () => {
    mockedApiFetch.mockResolvedValue(makeAsset({ ownershipStatus: "pending" }));
    renderWithQueryClient(<AssetDetailPage id="asset-1" />);

    expect(await screen.findByRole("button", { name: /verify dns record/i })).toBeInTheDocument();
    expect(screen.queryByText(/ownership verified/i)).not.toBeInTheDocument();
  });

  it("a verified asset shows the verified state and a path toward scanning, not the setup wizard", async () => {
    mockedApiFetch.mockResolvedValue(makeAsset({ ownershipStatus: "verified", verifiedAt: "2026-09-10T00:00:00.000Z" }));
    renderWithQueryClient(<AssetDetailPage id="asset-1" />);

    expect(await screen.findByText(/ownership verified/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run first scan/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify dns record/i })).not.toBeInTheDocument();
  });

  it("a revoked asset renders a clear terminal state and offers no verify action", async () => {
    mockedApiFetch.mockResolvedValue(makeAsset({ ownershipStatus: "revoked" }));
    renderWithQueryClient(<AssetDetailPage id="asset-1" />);

    expect(await screen.findByText(/ownership revoked/i)).toBeInTheDocument();
    expect(screen.getByText(/scans are unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /revoke ownership/i })).not.toBeInTheDocument();
  });

  it("a 404 from the backend renders a safe not-found state, never a raw exception", async () => {
    mockedApiFetch.mockRejectedValue(new ApiError(404, "We couldn't find what you were looking for."));
    renderWithQueryClient(<AssetDetailPage id="does-not-exist" />);

    expect(await screen.findByText("This asset doesn't exist, or you don't have access to it.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("shows the skeleton before data arrives", () => {
    mockedApiFetch.mockImplementation(() => new Promise(() => {}));
    renderWithQueryClient(<AssetDetailPage id="asset-1" />);
    expect(screen.getByTestId("asset-detail-skeleton")).toBeInTheDocument();
  });

  it("hides the Revoke action for a viewer", async () => {
    mockedUseAuth.mockReturnValue({
      user: { userId: "user-1", organizationId: "org-1", role: "viewer" },
      accessToken: "token",
      isInitializing: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });
    mockPermissions(["dashboard.view", "assets.view"], "viewer");
    mockedApiFetch.mockResolvedValue(makeAsset({ ownershipStatus: "verified" }));
    renderWithQueryClient(<AssetDetailPage id="asset-1" />);

    await screen.findByText(/ownership verified/i);
    expect(screen.queryByRole("button", { name: /revoke ownership/i })).not.toBeInTheDocument();
  });

  it("a successful verification updates the detail view to the verified state", async () => {
    const user = userEvent.setup();
    const pending = makeAsset({ ownershipStatus: "pending" });
    const verified = { ...pending, ownershipStatus: "verified" as const, verifiedAt: "2026-09-17T00:00:00.000Z" };

    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === `/assets/${pending.id}` && (!options || options.method === undefined)) return Promise.resolve(pending);
      if (path === `/assets/${pending.id}/verify`) return Promise.resolve({ asset: verified, verificationInstructions: "...", checkDetail: "Found matching TXT record" });
      throw new Error(`unexpected call ${path}`);
    });

    renderWithQueryClient(<AssetDetailPage id={pending.id} />);

    await user.click(await screen.findByRole("button", { name: /verify dns record/i }));

    expect(await screen.findByText(/ownership verified/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run first scan/i })).toBeInTheDocument();
  });

  it("never renders a Stripe identifier or a password hash", async () => {
    mockedApiFetch.mockResolvedValue(makeAsset({ ownershipStatus: "verified" }));
    const { container } = renderWithQueryClient(<AssetDetailPage id="asset-1" />);
    await screen.findByText(/ownership verified/i);

    expect(container.textContent).not.toMatch(/stripe/i);
    expect(container.textContent).not.toMatch(/passwordHash/i);
  });
});
