import { LayoutDashboard, Building2, CreditCard, Blocks, ScrollText, Receipt, Settings, Globe, Banknote, LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function adminPageTitleForPath(pathname: string): string {
  // "/admin" itself must only match exactly — every other item's href is a
  // prefix of some /admin/* path, so exact matches are checked first to
  // avoid the root Overview item swallowing every subpage's title.
  const exact = ADMIN_NAV_ITEMS.find((item) => pathname === item.href);
  if (exact) return exact.label;
  const prefixed = ADMIN_NAV_ITEMS.find((item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
  return prefixed?.label ?? "Platform Admin";
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "Plans", href: "/admin/plans", icon: CreditCard },
  { label: "Features", href: "/admin/features", icon: Blocks },
  { label: "Billing Events", href: "/admin/billing-events", icon: Receipt },
  { label: "Cash Payments", href: "/admin/cash-payments", icon: Banknote },
  { label: "Audit", href: "/admin/audit", icon: ScrollText },
  { label: "Website", href: "/admin/website", icon: Globe },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
