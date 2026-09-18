import { AuthTokens } from "../api/types";

// A plain module-level store, deliberately outside React state — the API
// client (lib/api/client.ts) needs synchronous read/write access to tokens
// from plain async functions that run outside any component (query
// functions, the 401-retry path), and importing React context there would
// be backwards. AuthProvider (auth-context.tsx) is the only thing that
// subscribes to this and mirrors it into React state for rendering.
const ACCESS_KEY = "scanning_engine_access_token";
const REFRESH_KEY = "scanning_engine_refresh_token";

let tokens: AuthTokens | null = null;
const listeners = new Set<() => void>();

function persist(next: AuthTokens | null) {
  try {
    if (next) {
      localStorage.setItem(ACCESS_KEY, next.accessToken);
      localStorage.setItem(REFRESH_KEY, next.refreshToken);
    } else {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch {
    // Private-mode/blocked storage — the session simply won't survive a
    // reload; not fatal to the current tab.
  }
}

export function getTokens(): AuthTokens | null {
  return tokens;
}

export function setTokens(next: AuthTokens | null): void {
  tokens = next;
  persist(next);
  listeners.forEach((listener) => listener());
}

export function subscribeToTokens(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Called once on app boot (AuthProvider) to hydrate from localStorage — never called mid-session. */
export function loadPersistedTokens(): AuthTokens | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (accessToken && refreshToken) {
      tokens = { accessToken, refreshToken };
      return tokens;
    }
  } catch {
    // ignore — see persist()
  }
  return null;
}

let sessionExpiredHandler: (() => void) | null = null;

/** AuthProvider registers this once, so the plain API client can trigger a redirect-to-login without importing next/navigation. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  setTokens(null);
  sessionExpiredHandler?.();
}
