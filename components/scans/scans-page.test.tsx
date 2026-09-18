import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { ScansPage } from "./scans-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeScan, makeScanList, makeOverview } from "@/test/fixtures";
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

function setRole(role: "owner" | "admin" | "member" | "viewer") {
  mockedUseAuth.mockReturnValue({
    user: { userId: "user-1", organizationId: "org-1", role },
    accessToken: "token",
    isInitializing: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  });
}

function mockRoutes(scansResponse: unknown, overviewResponse = makeOverview()) {
  mockedApiFetch.mockImplementation((path: string) => {
    if (path.startsWith("/scans")) return Promise.resolve(scansResponse);
    if (path === "/dashboard/overview") return Promise.resolve(overviewResponse);
    if (path === "/assets") return Promise.resolve([]);
    throw new Error(`unexpected path ${path}`);
  });
}

beforeEach(() => {
  setRole("owner");
  mockPermissions([...PERMISSIONS], "owner");
  mockedApiFetch.mockReset();
});

describe("ScansPage", () => {
  it("renders the loading skeleton before data arrives", () => {
    mockedApiFetch.mockImplementation(() => new Promise(() => {}));
    renderWithQueryClient(<ScansPage />);
    expect(screen.getByTestId("scans-skeleton")).toBeInTheDocument();
  });

  it("renders scans loaded from the API", async () => {
    mockRoutes(makeScanList([makeScan({ id: "scan-1", asset: { id: "a1", hostname: "example.com" } })]));
    renderWithQueryClient(<ScansPage />);

    expect((await screen.findAllByText("example.com")).length).toBeGreaterThan(0);
  });

  it("renders the empty state with the exact required copy", async () => {
    mockRoutes(makeScanList([]));
    renderWithQueryClient(<ScansPage />);

    expect(await screen.findByText("No scans yet")).toBeInTheDocument();
    expect(screen.getByText("Verify an asset and run your first scan.")).toBeInTheDocument();
  });

  it("renders a recoverable error state on failure", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path.startsWith("/scans")) return Promise.reject(new ApiError(500, "Something went wrong on our end. Please try again."));
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });
    renderWithQueryClient(<ScansPage />);

    expect(await screen.findByText("Something went wrong on our end. Please try again.")).toBeInTheDocument();
  });

  it("hides Run Scan for a viewer", async () => {
    setRole("viewer");
    mockPermissions(["dashboard.view", "scans.view"], "viewer");
    mockRoutes(makeScanList([makeScan()]));
    renderWithQueryClient(<ScansPage />);

    await screen.findAllByText("example.com");
    expect(screen.queryByRole("button", { name: /run scan/i })).not.toBeInTheDocument();
  });

  it("filtering by status re-queries with the selected status", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    mockRoutes(makeScanList([makeScan({ status: "completed" })]));
    renderWithQueryClient(<ScansPage />);

    await screen.findAllByText("example.com");
    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining("status=completed"));
  });
});
