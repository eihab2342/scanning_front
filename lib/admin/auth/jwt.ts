import { AdminJwtPayload } from "../api/types";

/** Client-side decode for reading claims only — never verification (see lib/auth/jwt.ts's tenant equivalent for the same caveat). */
export function decodeAdminJwt(token: string): AdminJwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = typeof window === "undefined" ? Buffer.from(padded, "base64").toString("utf8") : atob(padded);
    return JSON.parse(json) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function isAdminTokenExpired(token: string, skewSeconds = 10): boolean {
  const payload = decodeAdminJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
