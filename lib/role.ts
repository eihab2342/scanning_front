import { Role } from "./api/types";

// Mirrors src/common/role-hierarchy.ts exactly — the frontend never invents
// its own ranking. This is UX-only (hiding/disabling controls); the real
// authorization boundary is always the backend's RolesGuard.
const ROLE_RANK: Record<Role, number> = { viewer: 1, member: 2, admin: 3, owner: 4 };

export function roleAtLeast(role: Role | undefined, minimum: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function roleDescription(role: Role): string {
  switch (role) {
    case "owner":
      return "Full control, including billing and every team member.";
    case "admin":
      return "Manages the team, assets, and organization settings.";
    case "member":
      return "Can add assets, verify ownership, and run scans.";
    case "viewer":
      return "Read-only access to everything in the organization.";
  }
}

const ALL_ROLES: Role[] = ["owner", "admin", "member", "viewer"];

/** The roles an actor is allowed to assign to someone else — never above their own rank (mirrors src/common/role-hierarchy.ts's roleAtOrBelow, enforced for real on the backend). */
export function assignableRoles(actorRole: Role | undefined): Role[] {
  if (!actorRole) return [];
  return ALL_ROLES.filter((role) => ROLE_RANK[role] <= ROLE_RANK[actorRole]);
}

/**
 * Mirrors src/permissions/permissions.service.ts's canManageAccessFor
 * exactly — UX-only (whether to show the "Manage Access" action for a
 * given row); the backend re-enforces this for real on every Manage Access
 * request.
 */
export function canManageAccessFor(actorRole: Role | undefined, targetRole: Role): boolean {
  if (!actorRole) return false;
  if (actorRole === "owner") return targetRole !== "owner";
  if (actorRole === "admin") return targetRole === "member" || targetRole === "viewer";
  return false;
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    case "viewer":
      return "Viewer";
  }
}
