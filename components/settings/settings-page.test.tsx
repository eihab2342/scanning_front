import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "./settings-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeOrganization, makeSafeUser } from "@/test/fixtures";
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

function stubApi() {
  mockedApiFetch.mockImplementation((path: string, options?: RequestInit) => {
    if (path === "/organizations/me" && (!options || options.method === undefined)) return Promise.resolve(makeOrganization());
    if (path === "/organizations/me" && options?.method === "PATCH") {
      return Promise.resolve(makeOrganization({ name: JSON.parse(options.body as string).name }));
    }
    if (path === "/auth/me") return Promise.resolve(makeSafeUser());
    throw new Error(`unexpected path ${path}`);
  });
}

beforeEach(() => {
  setRole("owner");
  mockPermissions([...PERMISSIONS], "owner");
  mockedApiFetch.mockReset();
  stubApi();
});

describe("SettingsPage", () => {
  it("renders organization data on the General tab for an owner", async () => {
    renderWithQueryClient(<SettingsPage />);
    expect(await screen.findByDisplayValue("Acme Inc")).toBeInTheDocument();
  });

  it("a member (lower than admin) has no General tab and lands on Account", async () => {
    setRole("member");
    mockPermissions(["dashboard.view", "organization.view", "profile.view", "profile.change_password"], "member");
    renderWithQueryClient(<SettingsPage />);

    expect(screen.queryByRole("button", { name: "General" })).not.toBeInTheDocument();
    expect(await screen.findByText("My account")).toBeInTheDocument();
  });

  it("updating the organization name only ever submits the `name` field, never a forbidden field", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SettingsPage />);

    const input = await screen.findByDisplayValue("Acme Inc");
    await user.clear(input);
    await user.type(input, "New Org Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path, options]) => path === "/organizations/me" && (options as RequestInit)?.method === "PATCH");
      expect(call).toBeDefined();
      const body = JSON.parse((call![1] as RequestInit).body as string);
      expect(body).toEqual({ name: "New Org Name" });
    });
  });

  it("switches to the Account tab and renders the current user's profile", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SettingsPage />);
    await screen.findByDisplayValue("Acme Inc");

    await user.click(screen.getByRole("button", { name: "Account" }));

    expect(await screen.findByDisplayValue("owner@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Owner")).toBeInTheDocument();
  });

  it("switches to the Security tab and validates the password form before submitting", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SettingsPage />);
    await screen.findByDisplayValue("Acme Inc");

    await user.click(screen.getByRole("button", { name: "Security" }));
    await user.type(screen.getByLabelText(/current password/i), "OldPassw0rd1");
    await user.type(screen.getByLabelText(/^new password$/i), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "short");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(mockedApiFetch.mock.calls.some(([path]) => path === "/auth/change-password")).toBe(false);
  });

  it("submits current/new password correctly and never persists them to localStorage", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/organizations/me") return Promise.resolve(makeOrganization());
      if (path === "/auth/me") return Promise.resolve(makeSafeUser());
      if (path === "/auth/change-password") return Promise.resolve({ success: true });
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<SettingsPage />);
    await screen.findByDisplayValue("Acme Inc");
    await user.click(screen.getByRole("button", { name: "Security" }));

    await user.type(screen.getByLabelText(/current password/i), "OldPassw0rd1");
    await user.type(screen.getByLabelText(/^new password$/i), "NewPassw0rd2");
    await user.type(screen.getByLabelText(/confirm new password/i), "NewPassw0rd2");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      const call = mockedApiFetch.mock.calls.find(([path]) => path === "/auth/change-password");
      expect(call).toBeDefined();
      expect(JSON.parse((call![1] as RequestInit).body as string)).toEqual({ currentPassword: "OldPassw0rd1", newPassword: "NewPassw0rd2" });
    });

    expect(localStorage.getItem("OldPassw0rd1")).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain("NewPassw0rd2");
  });

  it("surfaces an incorrect-current-password error from the backend", async () => {
    const user = userEvent.setup();
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/organizations/me") return Promise.resolve(makeOrganization());
      if (path === "/auth/me") return Promise.resolve(makeSafeUser());
      if (path === "/auth/change-password") return Promise.reject(new ApiError(401, "Current password is incorrect"));
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<SettingsPage />);
    await screen.findByDisplayValue("Acme Inc");
    await user.click(screen.getByRole("button", { name: "Security" }));

    await user.type(screen.getByLabelText(/current password/i), "WrongPassword1");
    await user.type(screen.getByLabelText(/^new password$/i), "NewPassw0rd2");
    await user.type(screen.getByLabelText(/confirm new password/i), "NewPassw0rd2");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
  });
});
