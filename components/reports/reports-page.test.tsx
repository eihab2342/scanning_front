import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { ReportsPage } from "./reports-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeReport } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/api/types";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({ user: { userId: "user-1", organizationId: "org-1", role: "owner" }, accessToken: "token", isInitializing: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
}));

import { apiFetch } from "@/lib/api/client";
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
  mockPermissions([...PERMISSIONS], "owner");
});

describe("ReportsPage", () => {
  it("renders reports loaded from the API", async () => {
    mockedApiFetch.mockResolvedValue([makeReport({ id: "r1", asset: { id: "a1", hostname: "example.com" } })]);
    renderWithQueryClient(<ReportsPage />);

    expect((await screen.findAllByText("example.com")).length).toBeGreaterThan(0);
  });

  it("renders the empty state with the exact required copy", async () => {
    mockedApiFetch.mockResolvedValue([]);
    renderWithQueryClient(<ReportsPage />);

    expect(await screen.findByText("No reports yet")).toBeInTheDocument();
    expect(screen.getByText("Reports will appear here after eligible scans complete.")).toBeInTheDocument();
  });

  it("renders a recoverable error state on failure", async () => {
    mockedApiFetch.mockRejectedValue(new ApiError(500, "Something went wrong on our end. Please try again."));
    renderWithQueryClient(<ReportsPage />);

    expect(await screen.findByText("Something went wrong on our end. Please try again.")).toBeInTheDocument();
  });

  it("13. Download follows reports.download, not role — hidden when denied", async () => {
    mockPermissions(["dashboard.view", "reports.view"], "viewer");
    mockedApiFetch.mockResolvedValue([makeReport({ id: "r1", asset: { id: "a1", hostname: "example.com" } })]);
    renderWithQueryClient(<ReportsPage />);

    await screen.findAllByText("example.com");
    expect(screen.queryByRole("button", { name: /download report/i })).not.toBeInTheDocument();
  });

  it("13. Download is shown when reports.download is granted", async () => {
    mockedApiFetch.mockResolvedValue([makeReport({ id: "r1", asset: { id: "a1", hostname: "example.com" } })]);
    renderWithQueryClient(<ReportsPage />);

    await screen.findAllByText("example.com");
    expect(screen.getAllByRole("button", { name: /download report/i }).length).toBeGreaterThan(0);
  });
});
