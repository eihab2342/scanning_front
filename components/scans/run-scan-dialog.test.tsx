import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RunScanDialog } from "./run-scan-dialog";
import { renderWithQueryClient } from "@/test/test-utils";
import { makeAsset } from "@/test/fixtures";
import { makeOverview } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({ user: { userId: "user-1", organizationId: "org-1", role: "owner" }, accessToken: "token", isInitializing: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
}));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

import { apiFetch } from "@/lib/api/client";
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockPush.mockReset();
});

function mockAssetsAndOverview(assets: ReturnType<typeof makeAsset>[], overview = makeOverview()) {
  mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
    if (path === "/assets") return Promise.resolve(assets);
    if (path === "/dashboard/overview") return Promise.resolve(overview);
    if (path === "/scans" && options?.method === "POST") {
      return Promise.resolve(makeAssetlessScan());
    }
    throw new Error(`unexpected call ${path}`);
  });
}

function makeAssetlessScan() {
  return { id: "scan-new", status: "queued", asset: { id: "asset-1", hostname: "example.com" }, createdAt: new Date().toISOString(), completedAt: null, hasReport: false, reportId: null, failureSummary: null };
}

describe("RunScanDialog", () => {
  it("only lists verified assets, never pending or revoked ones", async () => {
    mockAssetsAndOverview([
      makeAsset({ id: "a1", hostname: "verified.example.com", ownershipStatus: "verified" }),
      makeAsset({ id: "a2", hostname: "pending.example.com", ownershipStatus: "pending" }),
      makeAsset({ id: "a3", hostname: "revoked.example.com", ownershipStatus: "revoked" }),
    ]);

    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} />);

    expect(await screen.findByText("verified.example.com")).toBeInTheDocument();
    expect(screen.queryByText("pending.example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("revoked.example.com")).not.toBeInTheDocument();
  });

  it("shows a 'no verified assets' state with a link to Assets when none are verified", async () => {
    mockAssetsAndOverview([makeAsset({ ownershipStatus: "pending" })]);
    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} />);

    expect(await screen.findByText("No verified assets")).toBeInTheDocument();
    expect(screen.getByText("A verified asset is required before running a scan.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to assets/i })).toHaveAttribute("href", "/assets");
  });

  it("preselects the asset passed in via preselectedAssetId", async () => {
    mockAssetsAndOverview([
      makeAsset({ id: "a1", hostname: "one.example.com", ownershipStatus: "verified" }),
      makeAsset({ id: "a2", hostname: "two.example.com", ownershipStatus: "verified" }),
    ]);

    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} preselectedAssetId="a2" />);
    await screen.findByText("one.example.com");

    expect(screen.getByText("two.example.com").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("one.example.com").closest("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("disables scan creation and explains the limit when quota is exhausted", async () => {
    mockAssetsAndOverview(
      [makeAsset({ ownershipStatus: "verified" })],
      makeOverview({ usage: { scans: { limit: 10, used: 10, remaining: 0 }, assets: { limit: null, total: 1, verified: 1, pending: 0, revoked: 0 }, teamMembers: { limit: null, used: 1 } } }),
    );
    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} />);

    expect(await screen.findByText(/used all scans available/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^run scan$/i })).not.toBeInTheDocument();
  });

  it("a successful scan creation navigates to the new scan's detail page", async () => {
    const user = userEvent.setup();
    mockAssetsAndOverview([makeAsset({ id: "a1", hostname: "example.com", ownershipStatus: "verified" })]);
    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} preselectedAssetId="a1" />);

    await user.click(await screen.findByRole("button", { name: /^run scan$/i }));

    expect(mockPush).toHaveBeenCalledWith("/scans/scan-new");
  });

  it("a failed scan creation (e.g. quota race) is surfaced inline, not as a raw exception", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/assets") return Promise.resolve([makeAsset({ id: "a1", ownershipStatus: "verified" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      if (path === "/scans" && options?.method === "POST") {
        return Promise.reject(new ApiError(403, "Subscription is not active or scan quota has been reached"));
      }
      throw new Error(`unexpected call ${path}`);
    });

    renderWithQueryClient(<RunScanDialog open onOpenChange={vi.fn()} preselectedAssetId="a1" />);
    await user.click(await screen.findByRole("button", { name: /^run scan$/i }));

    expect(await screen.findByText("Subscription is not active or scan quota has been reached")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
