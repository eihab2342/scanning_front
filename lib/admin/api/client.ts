import { getAdminToken, notifyAdminSessionExpired } from "../auth/token-store";
import { ApiError } from "../../api/client";

export const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

interface BackendErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function humanizeError(status: number, body: BackendErrorBody | undefined, isAuthAttempt: boolean): string {
  const backendMessage = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;

  switch (status) {
    case 400:
      return backendMessage || "That request wasn't valid.";
    case 401:
      // A 401 from the login call itself means "wrong email/password", not
      // "your existing session expired" — those are different failures and
      // must not share copy (a login attempt has no session to expire yet).
      return isAuthAttempt ? backendMessage || "Invalid email or password." : "Your admin session has expired. Please log in again.";
    case 403:
      return backendMessage || "Your platform-admin role doesn't allow this action.";
    case 404:
      return backendMessage || "We couldn't find what you were looking for.";
    case 409:
      return backendMessage || "This conflicts with existing data.";
    case 422:
      return backendMessage || "Some of the submitted data is invalid.";
    default:
      return status >= 500 ? "Something went wrong on our end. Please try again." : backendMessage || "Something went wrong.";
  }
}

/**
 * Deliberately its own fetch wrapper, not a parameterized version of
 * lib/api/client.ts's apiFetch — there is no admin refresh token to retry
 * with (see token-store.ts), so the 401 handling is simpler by design:
 * one failed request just ends the session, it never tries to recover one.
 */
export async function adminApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isAuthAttempt = path === "/admin/auth/login";
  const res = await fetch(`${ADMIN_API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let body: BackendErrorBody | undefined;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    // Only an authenticated request rejecting a real token means the
    // session expired — a bad login attempt never had a session to clear.
    if (res.status === 401 && !isAuthAttempt) notifyAdminSessionExpired();
    throw new ApiError(res.status, humanizeError(res.status, body, isAuthAttempt), body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { ApiError };
