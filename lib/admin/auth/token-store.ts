// Fully separate from the tenant token store (lib/auth/token-store.ts) —
// platform admin auth has its own secret, its own JWT strategy, and no
// refresh-token concept at all (see AdminJwtStrategy's schema comment).
// A single 30-minute access token is the entire session; it just expires
// and the admin logs in again.
const ADMIN_ACCESS_KEY = "scanning_engine_admin_access_token";

let token: string | null = null;
const listeners = new Set<() => void>();

function persist(next: string | null) {
  try {
    if (next) {
      localStorage.setItem(ADMIN_ACCESS_KEY, next);
    } else {
      localStorage.removeItem(ADMIN_ACCESS_KEY);
    }
  } catch {
    // Private-mode/blocked storage — the session simply won't survive a reload.
  }
}

export function getAdminToken(): string | null {
  return token;
}

export function setAdminToken(next: string | null): void {
  token = next;
  persist(next);
  listeners.forEach((listener) => listener());
}

export function subscribeToAdminToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Called once on mount (AdminAuthProvider) to hydrate from localStorage. */
export function loadPersistedAdminToken(): string | null {
  try {
    const stored = localStorage.getItem(ADMIN_ACCESS_KEY);
    if (stored) {
      token = stored;
      return stored;
    }
  } catch {
    // ignore — see persist()
  }
  return null;
}

let sessionExpiredHandler: (() => void) | null = null;

export function setAdminSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function notifyAdminSessionExpired(): void {
  setAdminToken(null);
  sessionExpiredHandler?.();
}
