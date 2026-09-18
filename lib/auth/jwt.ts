import { JwtPayload } from "../api/types";

/**
 * Client-side JWT decode for reading claims only (userId/organizationId/role/email) —
 * this is NOT verification. The signature is never checked here; that only ever
 * happens server-side (JwtStrategy.validate). Every backend request re-verifies
 * the token independently, so a tampered payload here can only ever affect this
 * browser tab's own UI state, never actual authorization.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = typeof window === "undefined" ? Buffer.from(padded, "base64").toString("utf8") : atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** `exp` is in seconds since epoch; a small skew buffer avoids treating a token as valid one tick before real expiry. */
export function isTokenExpired(token: string, skewSeconds = 10): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
