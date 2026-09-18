// The tenant-side half of platform-admin impersonation ("view as" — see
// src/admin/impersonation.service.ts). sessionStorage, not localStorage:
// an impersonation session should not silently survive into a new tab or
// a later browser session — it's explicit and time-boxed by design
// (saas-handoff.md §12.4/§12.5), matching the 15-minute token TTL.
export interface ImpersonationSession {
  organizationId: string;
  organizationName: string;
  actingAsEmail: string;
  startedAt: number;
  expiresInSeconds: number;
}

const KEY = "scanning_engine_impersonation";

export function setImpersonationSession(session: ImpersonationSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // ignore — not fatal, only the banner won't render
  }
}

export function getImpersonationSession(): ImpersonationSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ImpersonationSession) : null;
  } catch {
    return null;
  }
}

export function clearImpersonationSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// A transient, in-memory-only flag (deliberately not persisted) that tells
// DashboardShell's own "no user -> /login" redirect to stand down for one
// tick: exiting impersonation clears the tenant token reactively (see
// ImpersonationBanner), which would otherwise race that redirect and can
// win it, bouncing through /login before landing back on the intended
// /admin/organizations/:id page.
let exitingImpersonation = false;

export function markExitingImpersonation(): void {
  exitingImpersonation = true;
}

/** Reads and immediately clears the flag — it only ever suppresses the one redirect it was set for. */
export function consumeExitingImpersonationFlag(): boolean {
  const value = exitingImpersonation;
  exitingImpersonation = false;
  return value;
}
