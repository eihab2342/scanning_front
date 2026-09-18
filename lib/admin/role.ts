import { PlatformAdminRole } from "./api/types";

/**
 * Mirrors every @PlatformRoles(...) decorator on the backend admin
 * controllers exactly (src/admin/*.controller.ts) — never invented
 * client-side. This only gates which controls render; the backend
 * (PlatformRolesGuard) is what actually enforces it, and every mutation
 * still has to handle a 403 gracefully in case this list ever drifts.
 */
export const ADMIN_ACTIONS = [
  "organization.suspend",
  "organization.unsuspend",
  "organization.impersonate",
  "organization.update_subscription",
  "subscription.override_write",
  "plan.write",
  "feature.write",
  "plan_feature.write",
  "platform_settings.manage",
  "content.manage",
  "cash_payment.review",
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

const ACTION_ROLES: Record<AdminAction, PlatformAdminRole[]> = {
  "organization.suspend": ["super_admin"],
  "organization.unsuspend": ["super_admin"],
  "organization.impersonate": ["super_admin", "support"],
  "organization.update_subscription": ["super_admin", "billing_ops"],
  "subscription.override_write": ["super_admin", "billing_ops"],
  "plan.write": ["super_admin", "billing_ops"],
  "feature.write": ["super_admin", "billing_ops"],
  "plan_feature.write": ["super_admin", "billing_ops"],
  "platform_settings.manage": ["super_admin"],
  "content.manage": ["super_admin"],
  "cash_payment.review": ["super_admin", "billing_ops"],
};

export function canPerform(role: PlatformAdminRole | null | undefined, action: AdminAction): boolean {
  if (!role) return false;
  return ACTION_ROLES[action].includes(role);
}

export function roleLabel(role: PlatformAdminRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "support":
      return "Support";
    case "billing_ops":
      return "Billing Ops";
  }
}
