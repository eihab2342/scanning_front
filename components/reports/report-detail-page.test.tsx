import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportDetailPage } from "./report-detail-page";
import { renderWithQueryClient } from "@/test/test-utils";
import { makeReport } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";

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
});

describe("ReportDetailPage", () => {
  it("renders report details, and links to the associated scan", async () => {
    mockedApiFetch.mockResolvedValue(makeReport({ scanId: "scan-1", asset: { id: "a1", hostname: "example.com" } }));
    renderWithQueryClient(<ReportDetailPage id="report-1" />);

    expect(await screen.findAllByText("example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: /view scan/i })).toHaveAttribute("href", "/scans/scan-1");
  });

  it("a 404 renders a safe not-found state", async () => {
    mockedApiFetch.mockRejectedValue(new ApiError(404, "not found"));
    renderWithQueryClient(<ReportDetailPage id="does-not-exist" />);

    expect(await screen.findByText("This report doesn't exist, or you don't have access to it.")).toBeInTheDocument();
  });

  it("the download action triggers a real file fetch with auth, not a plain unauthenticated link", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockResolvedValue(makeReport({ id: "report-1" }));

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("report text", { status: 200, headers: { "Content-Disposition": 'attachment; filename="report-example.com-abcd1234.txt"' } }),
    );
    // jsdom doesn't implement anchor.click()/URL.createObjectURL navigation — stub them so the download flow can complete.
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderWithQueryClient(<ReportDetailPage id="report-1" />);
    await user.click(await screen.findByRole("button", { name: /^download$/i }));

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/reports/report-1/download"), expect.objectContaining({ headers: expect.anything() })));
    expect(clickSpy).toHaveBeenCalled();
  });
});
