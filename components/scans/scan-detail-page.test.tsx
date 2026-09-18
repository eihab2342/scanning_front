import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { ScanDetailPage } from "./scan-detail-page";
import { renderWithQueryClient } from "@/test/test-utils";
import { makeScan } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({ user: { userId: "user-1", organizationId: "org-1", role: "owner" }, accessToken: "token", isInitializing: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
}));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});

import { apiFetch } from "@/lib/api/client";
const mockedApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
});

describe("ScanDetailPage — status states", () => {
  it("queued: shows a clean waiting state, no fake percentage", async () => {
    mockedApiFetch.mockResolvedValue(makeScan({ status: "queued" }));
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    expect(await screen.findByText("Scan queued")).toBeInTheDocument();
    expect(screen.getByText(/waiting to be processed/i)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("running: shows an indeterminate in-progress state, no fake percentage or step count", async () => {
    mockedApiFetch.mockResolvedValue(makeScan({ status: "running" }));
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    expect(await screen.findByText("Scan in progress")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/step \d/i)).not.toBeInTheDocument();
  });

  it("completed: shows the honest summary and a View Report link when a report exists", async () => {
    mockedApiFetch.mockResolvedValue(
      makeScan({ status: "completed", completedAt: "2026-09-01T00:05:00.000Z", hasReport: true, reportId: "report-1" }),
    );
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    expect(await screen.findByText(/scanned successfully/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /view report/i }).length).toBeGreaterThan(0);
  });

  it("failed: shows a safe failure summary (never a stack trace) and a Run New Scan action", async () => {
    mockedApiFetch.mockResolvedValue(
      makeScan({ status: "failed", failureSummary: "The scan could not complete. You can start a new scan for this asset." }),
    );
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    expect(await screen.findByText("Scan failed")).toBeInTheDocument();
    expect(screen.getByText("The scan could not complete. You can start a new scan for this asset.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run new scan/i })).toBeInTheDocument();
    expect(screen.queryByText(/at Object\.|node_modules|\.ts:\d+/i)).not.toBeInTheDocument();
  });

  it("a 404 renders a safe not-found state", async () => {
    mockedApiFetch.mockRejectedValue(new ApiError(404, "not found"));
    renderWithQueryClient(<ScanDetailPage id="does-not-exist" />);

    expect(await screen.findByText("This scan doesn't exist, or you don't have access to it.")).toBeInTheDocument();
  });
});

describe("ScanDetailPage — polling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls while the scan is queued/running", async () => {
    mockedApiFetch.mockResolvedValue(makeScan({ status: "running" }));
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    await vi.waitFor(() => expect(mockedApiFetch).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(3500);
    await vi.waitFor(() => expect(mockedApiFetch.mock.calls.length).toBeGreaterThan(1));
  });

  it("stops polling once the scan reaches a terminal state", async () => {
    mockedApiFetch.mockResolvedValue(makeScan({ status: "completed", completedAt: "2026-09-01T00:05:00.000Z" }));
    renderWithQueryClient(<ScanDetailPage id="scan-1" />);

    await vi.waitFor(() => expect(mockedApiFetch).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(10000);
    expect(mockedApiFetch).toHaveBeenCalledTimes(1);
  });
});
