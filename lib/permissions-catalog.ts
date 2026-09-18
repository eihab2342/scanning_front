import { Permission } from "./api/types";

/**
 * Display-only grouping/labels for the Manage Access dialog — mirrors
 * src/permissions/permission-catalog.ts's PERMISSIONS list exactly (one
 * entry per real permission key). The backend remains the source of truth
 * for what each key actually grants; this file only decides how to present
 * the catalog to an owner/admin.
 */
export interface PermissionCatalogEntry {
  permission: Permission;
  label: string;
}

export interface PermissionCatalogGroup {
  title: string;
  items: PermissionCatalogEntry[];
}

export const PERMISSION_CATALOG_GROUPS: PermissionCatalogGroup[] = [
  {
    title: "Dashboard",
    items: [{ permission: "dashboard.view", label: "View dashboard" }],
  },
  {
    title: "Assets",
    items: [
      { permission: "assets.view", label: "View assets" },
      { permission: "assets.create", label: "Add assets" },
      { permission: "assets.verify", label: "Verify assets" },
      { permission: "assets.revoke", label: "Revoke assets" },
    ],
  },
  {
    title: "Scans",
    items: [
      { permission: "scans.view", label: "View scans" },
      { permission: "scans.create", label: "Run scans" },
    ],
  },
  {
    title: "Reports",
    items: [
      { permission: "reports.view", label: "View reports" },
      { permission: "reports.download", label: "Download reports" },
      { permission: "reports.create", label: "Create reports" },
    ],
  },
  {
    title: "Activity",
    items: [
      { permission: "activity.view", label: "View operational activity" },
      { permission: "activity.view_team", label: "View team activity" },
      { permission: "activity.view_billing", label: "View billing activity" },
      { permission: "activity.view_security", label: "View security activity" },
    ],
  },
  {
    title: "Team",
    items: [
      { permission: "team.view", label: "View team" },
      { permission: "team.invite", label: "Invite members" },
      { permission: "team.change_role", label: "Manage roles" },
      { permission: "team.deactivate", label: "Deactivate members" },
      { permission: "team.reactivate", label: "Reactivate members" },
      { permission: "team.manage_access", label: "Manage member access" },
    ],
  },
  {
    title: "Organization",
    items: [
      { permission: "organization.view", label: "View organization" },
      { permission: "organization.update", label: "Manage organization settings" },
    ],
  },
  {
    title: "Billing",
    items: [
      { permission: "billing.view", label: "View billing" },
      { permission: "billing.checkout", label: "Start checkout" },
      { permission: "billing.change_plan", label: "Change plan" },
      { permission: "billing.cancel", label: "Cancel subscription" },
      { permission: "billing.reactivate", label: "Reactivate subscription" },
      { permission: "billing.portal", label: "Open billing portal" },
    ],
  },
  {
    title: "Usage",
    items: [{ permission: "usage.view", label: "View usage" }],
  },
  {
    title: "Profile",
    items: [
      { permission: "profile.view", label: "View own profile" },
      { permission: "profile.change_password", label: "Change own password" },
    ],
  },
];
