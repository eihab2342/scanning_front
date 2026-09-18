import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityPage } from "./activity-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeAuditLogEntry, makeAuditLogList } from "@/test/fixtures";
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
  mockedUseAuth.mockReturnValue({
    user: { userId: "user-1", organizationId: "org-1", role: "owner" },
    accessToken: "token",
    isInitializing: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  });
  mockPermissions([...PERMISSIONS], "owner");
  mockedApiFetch.mockReset();
});

describe("ActivityPage", () => {
  it("renders known events using the centralized label/formatter", async () => {
    mockedApiFetch.mockResolvedValue(
      makeAuditLogList([
        makeAuditLogEntry({ id: "1", action: "asset.created" }),
        makeAuditLogEntry({ id: "2", action: "user.invited" }),
      ]),
    );

    renderWithQueryClient(<ActivityPage />);

    expect(await screen.findByText("Asset added")).toBeInTheDocument();
    expect(screen.getByText("Team member invited")).toBeInTheDocument();
  });

  it("renders a graceful generic fallback for an unrecognized action key", async () => {
    mockedApiFetch.mockResolvedValue(makeAuditLogList([makeAuditLogEntry({ id: "1", action: "future.unseen_action" })]));

    renderWithQueryClient(<ActivityPage />);

    expect(await screen.findByText("future.unseen_action")).toBeInTheDocument();
  });

  it("shows the actor's email and never any raw metadata field", async () => {
    mockedApiFetch.mockResolvedValue(makeAuditLogList([makeAuditLogEntry({ id: "1", action: "asset.created", actor: { email: "owner@example.com" } })]));

    const { container } = renderWithQueryClient(<ActivityPage />);

    expect(await screen.findByText(/owner@example\.com/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/metadata/i);
    expect(container.textContent).not.toMatch(/passwordHash/i);
  });

  it("renders an empty state when there is no activity", async () => {
    mockedApiFetch.mockResolvedValue(makeAuditLogList([]));
    renderWithQueryClient(<ActivityPage />);
    expect(await screen.findByText("No activity yet")).toBeInTheDocument();
  });

  it("applies the selected category filter as a query parameter", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockResolvedValue(makeAuditLogList([makeAuditLogEntry({ id: "1", action: "user.invited" })]));

    renderWithQueryClient(<ActivityPage />);
    await screen.findByText("Team member invited");

    await user.click(screen.getByRole("button", { name: "Team" }));

    await screen.findByText("Team member invited");
    const call = mockedApiFetch.mock.calls.find(([path]) => typeof path === "string" && path.includes("category=team"));
    expect(call).toBeDefined();
  });

  it("a member does not render the Team or Billing activity tabs by default (17)", async () => {
    mockPermissions(
      ["dashboard.view", "activity.view", "activity.view_assets", "activity.view_scans", "activity.view_reports"],
      "member",
    );
    mockedApiFetch.mockResolvedValue(makeAuditLogList([makeAuditLogEntry({ id: "1", action: "asset.created" })]));

    renderWithQueryClient(<ActivityPage />);
    await screen.findByText("Asset added");

    expect(screen.queryByRole("button", { name: "Team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Billing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Security" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("an owner sees every activity category tab (4)", async () => {
    mockedApiFetch.mockResolvedValue(makeAuditLogList([]));
    renderWithQueryClient(<ActivityPage />);
    await screen.findByText("No activity yet");

    for (const label of ["All", "Security", "Assets", "Scans", "Reports", "Team", "Billing"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("shows pagination controls only when there is more than one page", async () => {
    mockedApiFetch.mockResolvedValue(makeAuditLogList([makeAuditLogEntry()], { page: 1, pageSize: 20, total: 45, totalPages: 3 }));

    renderWithQueryClient(<ActivityPage />);

    expect(await screen.findByText(/page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next page/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
  });
});
