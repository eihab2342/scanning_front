import { getTokens, setTokens, notifySessionExpired } from "../auth/token-store";
import { AuthTokens } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Nest's default error body shape (no custom ExceptionFilter exists on the
 * backend — see main.ts): { statusCode, message, error }. `message` is a
 * string for most thrown exceptions, or a string[] for ValidationPipe
 * failures.
 */
interface BackendErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function humanizeError(status: number, body: BackendErrorBody | undefined): string {
  const backendMessage = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;

  switch (status) {
    case 400:
      return backendMessage || "That request wasn't valid.";
    case 401:
      // A specific backend message (e.g. "Invalid email or password" from
      // /auth/login) means this 401 is about the credentials just submitted,
      // not an expired session — show it verbatim. Nest's default
      // JwtAuthGuard rejection has no such message (just the bare
      // "Unauthorized" reason), which IS the expired/invalid-token case.
      return backendMessage && backendMessage !== "Unauthorized" ? backendMessage : "Your session has expired. Please log in again.";
    case 403:
      return backendMessage || "You don't have permission to do that.";
    case 404:
      return backendMessage || "We couldn't find what you were looking for.";
    case 409:
      return backendMessage || "This conflicts with existing data.";
    case 422:
      return backendMessage || "Some of the submitted data is invalid.";
    case 429:
      return "Too many requests — please slow down and try again shortly.";
    default:
      return status >= 500 ? "Something went wrong on our end. Please try again." : backendMessage || "Something went wrong.";
  }
}

let refreshInFlight: Promise<string | null> | null = null;

/** De-duplicated: concurrent 401s from several in-flight requests trigger exactly one refresh call, not one each. */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const current = getTokens();
    if (!current?.refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (!res.ok) {
        notifySessionExpired();
        return null;
      }
      const data = (await res.json()) as { accessToken: string };
      const next: AuthTokens = { accessToken: data.accessToken, refreshToken: current.refreshToken };
      setTokens(next);
      return next.accessToken;
    } catch {
      notifySessionExpired();
      return null;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, retryOn401 = true): Promise<T> {
  const tokens = getTokens();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.accessToken) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retryOn401 && tokens?.refreshToken) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  if (!res.ok) {
    let body: BackendErrorBody | undefined;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    if (res.status === 401) notifySessionExpired();
    throw new ApiError(res.status, humanizeError(res.status, body), body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
