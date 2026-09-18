import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AssetsPage } from "./assets-page";
import { renderWithQueryClient, mockPermissions } from "@/test/test-utils";
import { makeAsset, makeOverview } from "@/test/fixtures";
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

beforeEach(() => {
  setRole("owner");
  mockPermissions([...PERMISSIONS], "owner");
  mockedApiFetch.mockReset();
});

describe("AssetsPage", () => {
  it("renders assets loaded from the API", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.resolve([makeAsset({ hostname: "example.com" }), makeAsset({ id: "asset-2", hostname: "app.example.com" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<AssetsPage />);

    expect((await screen.findAllByText("example.com")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("app.example.com").length).toBeGreaterThan(0);
  });

  it("renders the loading skeleton before data arrives", () => {
    mockedApiFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    renderWithQueryClient(<AssetsPage />);
    expect(screen.getByTestId("assets-skeleton")).toBeInTheDocument();
  });

  it("renders an empty state with a call to action when there are no assets", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.resolve([]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<AssetsPage />);

    expect(await screen.findByText("No assets yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add your first asset/i })).toBeInTheDocument();
  });

  it("renders a recoverable error state on failure", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.reject(new ApiError(500, "Something went wrong on our end. Please try again."));
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<AssetsPage />);

    expect(await screen.findByText("Something went wrong on our end. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("disables Add Asset and explains the plan limit once the effective asset limit is reached", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.resolve([makeAsset({ ownershipStatus: "verified" })]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview({ usage: { scans: { limit: 10, used: 0, remaining: 10 }, assets: { limit: 1, total: 1, verified: 1, pending: 0, revoked: 0 }, teamMembers: { limit: 5, used: 1 } } }));
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<AssetsPage />);

    const addButton = await screen.findByRole("button", { name: /add asset/i });
    expect(addButton).toBeDisabled();
    expect(await screen.findByText(/your current plan allows up to 1 assets/i)).toBeInTheDocument();
  });

  it("hides the Add Asset control for a viewer, who has no mutation permissions", async () => {
    setRole("viewer");
    mockPermissions(["dashboard.view", "assets.view"], "viewer");
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.resolve([makeAsset()]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    renderWithQueryClient(<AssetsPage />);

    await waitFor(() => expect(screen.queryByTestId("assets-skeleton")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /add asset/i })).not.toBeInTheDocument();
  });

  it("never renders a Stripe identifier or a password hash anywhere in the page", async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === "/assets") return Promise.resolve([makeAsset()]);
      if (path === "/dashboard/overview") return Promise.resolve(makeOverview());
      throw new Error(`unexpected path ${path}`);
    });

    const { container } = renderWithQueryClient(<AssetsPage />);
    await screen.findAllByText(makeAsset().hostname);

    expect(container.textContent).not.toMatch(/stripe/i);
    expect(container.textContent).not.toMatch(/passwordHash/i);
  });
});
