import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { getAdminToken, notifyAdminSessionExpired } = vi.hoisted(() => ({
  getAdminToken: vi.fn((): string | null => null),
  notifyAdminSessionExpired: vi.fn(),
}));

vi.mock("../auth/token-store", () => ({ getAdminToken, notifyAdminSessionExpired }));

import { adminApiFetch, ApiError } from "./client";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("adminApiFetch 401 handling", () => {
  beforeEach(() => {
    getAdminToken.mockReturnValue(null);
    notifyAdminSessionExpired.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces the backend's own message on a failed login attempt, not the session-expired copy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(401, { statusCode: 401, message: "Invalid email or password" })),
    );

    await expect(adminApiFetch("/admin/auth/login", { method: "POST", body: "{}" })).rejects.toMatchObject({
      message: "Invalid email or password",
    } satisfies Partial<ApiError>);
    expect(notifyAdminSessionExpired).not.toHaveBeenCalled();
  });

  it("uses the session-expired copy and clears the session for a 401 on any other admin endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { statusCode: 401, message: "Unauthorized" })));

    await expect(adminApiFetch("/admin/organizations")).rejects.toMatchObject({
      message: "Your admin session has expired. Please log in again.",
    } satisfies Partial<ApiError>);
    expect(notifyAdminSessionExpired).toHaveBeenCalledTimes(1);
  });
});
