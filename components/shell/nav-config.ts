import {
  LayoutDashboard,
  Server,
  ScanSearch,
  FileText,
  Users,
  History,
  Gauge,
  CreditCard,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Permission } from "@/lib/api/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The real backend-enforced capability that gates this item — see permission-catalog.ts. Absence means always visible to any authenticated user. */
  permission?: Permission;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export function pageTitleForPath(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return item.label;
    }
  }
  return "Dashboard";
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" }],
  },
  {
    label: "Security",
    items: [
      { label: "Assets", href: "/assets", icon: Server, permission: "assets.view" },
      { label: "Scans", href: "/scans", icon: ScanSearch, permission: "scans.view" },
      { label: "Reports", href: "/reports", icon: FileText, permission: "reports.view" },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "Team", href: "/team", icon: Users, permission: "team.view" },
      { label: "Activity", href: "/activity", icon: History, permission: "activity.view" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Usage", href: "/usage", icon: Gauge, permission: "usage.view" },
      { label: "Billing", href: "/billing", icon: CreditCard, permission: "billing.view" },
      // Every role can reach Settings — General is organization.update-gated
      // inside the page itself, but Account/Security are personal
      // (profile.view/profile.change_password, which every default role
      // has) — see settings-page.tsx's tab gating.
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
