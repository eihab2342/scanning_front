import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManageAccessDialog } from "./manage-access-dialog";
import { renderWithQueryClient } from "@/test/test-utils";
import { makeTeamMember } from "@/test/fixtures";
import { MemberPermissionsView } from "@/lib/api/types";

vi.mock("@/lib/auth/auth-context", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiFetch: vi.fn() };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api/client";
const mockedUseAuth = vi.mocked(useAuth);
const mockedApiFetch = vi.mocked(apiFetch);

const member = makeTeamMember({ id: "user-2", email: "eihab@example.com", role: "member" });

function baseView(overrides: Partial<MemberPermissionsView> = {}): MemberPermissionsView {
  return {
    userId: "user-2",
    role: "member",
    roleDefaults: ["dashboard.view", "assets.view", "assets.create", "scans.view", "scans.create"],
    overrides: [],
    effectivePermissions: ["dashboard.view", "assets.view", "assets.create", "scans.view", "scans.create"],
    ...overrides,
  };
}

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
});

describe("ManageAccessDialog", () => {
  it("7. shows role defaults as 'Default' with the inherited allow/deny state visible", async () => {
    mockedApiFetch.mockResolvedValue(baseView());
    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);

    expect(await screen.findByText("Add assets")).toBeInTheDocument();
    // assets.create is a role default -> "Default" is the active state, described as inherited/allowed.
    const row = screen.getByText("Add assets").closest("div")!.parentElement!;
    expect(row).toHaveTextContent(/inherited from role — allowed/i);
  });

  it("9. displays a Custom Allow override distinctly from a role default", async () => {
    mockedApiFetch.mockResolvedValue(baseView({ overrides: [{ permission: "billing.view", effect: "allow" }], effectivePermissions: [...baseView().effectivePermissions, "billing.view"] }));
    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);

    await screen.findByText("View billing");
    const row = screen.getByText("View billing").closest("div")!.parentElement!;
    expect(row).toHaveTextContent(/custom: allowed/i);
  });

  it("8. displays a Custom Deny override distinctly from a role default", async () => {
    mockedApiFetch.mockResolvedValue(baseView({ overrides: [{ permission: "scans.create", effect: "deny" }] }));
    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);

    await screen.findByText("Run scans");
    const row = screen.getByText("Run scans").closest("div")!.parentElement!;
    expect(row).toHaveTextContent(/custom: denied/i);
  });

  it("clicking Allow on a default-off permission issues a PUT with effect: allow", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/users/user-2/permissions" && (!options || !options.method)) return Promise.resolve(baseView());
      if (path === "/users/user-2/permissions" && options?.method === "PUT") {
        return Promise.resolve(baseView({ overrides: [{ permission: "billing.view", effect: "allow" }] }));
      }
      throw new Error(`unexpected ${path}`);
    });

    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);
    await screen.findByText("View billing");

    const row = screen.getByText("View billing").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Allow" }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path, opts]) => path === "/users/user-2/permissions" && (opts as RequestInit)?.method === "PUT");
      expect(call).toBeDefined();
      expect(JSON.parse((call![1] as RequestInit).body as string)).toEqual({ changes: [{ permission: "billing.view", effect: "allow" }] });
    });
  });

  it("10. Reset to role defaults calls the reset endpoint after confirmation", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
      if (path === "/users/user-2/permissions" && (!options || !options.method)) {
        return Promise.resolve(baseView({ overrides: [{ permission: "billing.view", effect: "allow" }] }));
      }
      if (path === "/users/user-2/permissions/reset" && options?.method === "POST") return Promise.resolve(baseView());
      throw new Error(`unexpected ${path}`);
    });

    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);
    await screen.findByText("View billing");

    await user.click(screen.getByRole("button", { name: /reset to role defaults/i }));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path, opts]) => path === "/users/user-2/permissions/reset" && (opts as RequestInit)?.method === "POST");
      expect(call).toBeDefined();
    });
  });

  it("Reset to role defaults is disabled when there are no overrides", async () => {
    mockedApiFetch.mockResolvedValue(baseView());
    renderWithQueryClient(<ManageAccessDialog member={member} open onOpenChange={() => {}} />);

    await screen.findByText("Add assets");
    expect(screen.getByRole("button", { name: /reset to role defaults/i })).toBeDisabled();
  });
});
