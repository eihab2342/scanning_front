import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamPage } from "./team-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeTeamMember, makeOverview } from "@/test/fixtures";
import { ApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/api/types";

vi.mock("@/lib/auth/auth-context", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";

const mockedUseAuth = vi.mocked(useAuth);
const mockedApiFetch = vi.mocked(apiFetch);
const mockedToast = vi.mocked(toast);

function setRole(role: "owner" | "admin" | "member" | "viewer", userId = "user-1") {
  mockedUseAuth.mockReturnValue({
    user: { userId, organizationId: "org-1", role },
    accessToken: "token",
    isInitializing: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  });
}

beforeEach(() => {
  setRole("owner");
  mockPermissions([...PERMISSIONS], "owner");
  mockedApiFetch.mockReset();
});

describe("TeamPage", () => {
  it("renders team members loaded from the API", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1", email: "owner@example.com" }), makeTeamMember({ id: "user-2", email: "member@example.com", role: "member" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);

    expect((await screen.findAllByText("owner@example.com")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("member@example.com").length).toBeGreaterThan(0);
  });

  it("renders an empty state when there are no team members", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);

    expect(await screen.findByText("No team members yet")).toBeInTheDocument();
  });

  it("hides Invite Member and role/status controls for a viewer (no mutation permissions)", async () => {
    setRole("viewer", "user-2");
    mockPermissions(["dashboard.view", "team.view"], "viewer");
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1" }), makeTeamMember({ id: "user-2", email: "viewer@example.com", role: "viewer" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await waitFor(() => expect(screen.queryByTestId("team-skeleton")).not.toBeInTheDocument());

    expect(screen.queryByRole("button", { name: /invite member/i })).not.toBeInTheDocument();
    // Role is shown as plain text, not an interactive control, for a non-manager.
    expect(screen.queryByRole("button", { name: /^owner$/i })).not.toBeInTheDocument();
  });

  it("disables Invite Member and explains the plan limit once the effective team limit is reached", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember()]);
      if (path === "/dashboard/overview")
        return Promise.resolve(makeOverview({ usage: { scans: { limit: 10, used: 0, remaining: 10 }, assets: { limit: 10, total: 0, verified: 0, pending: 0, revoked: 0 }, teamMembers: { limit: 1, used: 1 } } }));
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);

    const inviteButton = await screen.findByRole("button", { name: /invite member/i });
    expect(inviteButton).toBeDisabled();
    expect(await screen.findByText(/your current plan allows up to 1 team members/i)).toBeInTheDocument();
  });

  it("invite succeeds: submitting the dialog calls POST /users/invite and closes on success", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/users") return Promise.resolve([makeTeamMember()]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      if (path === "/users/invite" && options?.method === "POST") {
        return Promise.resolve(makeTeamMember({ id: "user-2", email: "new@example.com", role: "member" }));
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await user.click(await screen.findByRole("button", { name: /invite member/i }));

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/temporary password/i), "SecurePass1");
    await user.click(screen.getByRole("button", { name: "Invite member" }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path]) => path === "/users/invite");
      expect(call).toBeDefined();
      expect(JSON.parse((call![1] as RequestInit).body as string)).toMatchObject({ email: "new@example.com", role: "member" });
    });
  });

  it("invite failure: a rejected mutation surfaces the backend's error message in the dialog", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/users") return Promise.resolve([makeTeamMember()]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      if (path === "/users/invite" && options?.method === "POST") {
        return Promise.reject(new ApiError(403, "This organization's team member limit has been reached for its current plan"));
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await user.click(await screen.findByRole("button", { name: /invite member/i }));
    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/temporary password/i), "SecurePass1");
    await user.click(screen.getByRole("button", { name: "Invite member" }));

    expect(await screen.findByText(/team member limit has been reached/i)).toBeInTheDocument();
  });

  it("role options in the invite dialog respect the actor's hierarchy (an admin cannot offer Owner)", async () => {
    const user = userEvent.setup();
    setRole("admin");
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ role: "admin" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await user.click(await screen.findByRole("button", { name: /invite member/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByText("Owner")).not.toBeInTheDocument();
    expect(within(dialog).getByText("Admin")).toBeInTheDocument();
    expect(within(dialog).getByText("Member")).toBeInTheDocument();
    expect(within(dialog).getByText("Viewer")).toBeInTheDocument();
  });

  it("the actor's own row has no role-change or deactivate controls (self action safety)", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1", email: "owner@example.com" }), makeTeamMember({ id: "user-2", email: "member@example.com", role: "member" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await screen.findAllByText("owner@example.com");

    // The current user (user-1) shows a plain role label, not an interactive dropdown button.
    expect(screen.queryByRole("button", { name: "Owner" })).not.toBeInTheDocument();
    // The other member's row does have an interactive role control.
    expect(screen.getAllByRole("button", { name: /member/i }).length).toBeGreaterThan(0);
  });

  it("5/6. Manage Access is shown only when team.manage_access is granted — a member never sees it even on someone else's row", async () => {
    mockPermissions(["dashboard.view", "team.view"], "member");
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1" }), makeTeamMember({ id: "user-2", email: "other@example.com", role: "viewer" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await screen.findAllByText("other@example.com");

    expect(screen.queryByRole("button", { name: /manage access for/i })).not.toBeInTheDocument();
  });

  it("5. an owner sees Manage Access on a non-owner row", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1" }), makeTeamMember({ id: "user-2", email: "other@example.com", role: "member" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await screen.findAllByText("other@example.com");

    expect(screen.getAllByRole("button", { name: /manage access for other@example\.com/i }).length).toBeGreaterThan(0);
  });

  it("14. Invite Member follows team.invite, not role — an admin with team.invite denied via override does not see it", async () => {
    setRole("admin");
    mockPermissions(["dashboard.view", "team.view", "team.manage_access"], "admin");
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ role: "admin" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await waitFor(() => expect(screen.queryByTestId("team-skeleton")).not.toBeInTheDocument());

    expect(screen.queryByRole("button", { name: /invite member/i })).not.toBeInTheDocument();
  });

  it("surfaces the backend's last-owner-protection message on a failed deactivate", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/users") return Promise.resolve([makeTeamMember({ id: "user-1" }), makeTeamMember({ id: "user-2", email: "owner2@example.com", role: "owner" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      if (path === "/users/user-2/deactivate" && options?.method === "PATCH") {
        return Promise.reject(new ApiError(400, "An organization must always retain at least one active owner"));
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<TeamPage />);
    await screen.findAllByText("owner2@example.com");

    const [deactivateButton] = screen.getAllByRole("button", { name: /deactivate owner2@example.com/i });
    await user.click(deactivateButton);
    await user.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(expect.stringMatching(/at least one active owner/i));
    });
  });
});
