import {
  LucideIcon,
  UserPlus,
  UserCog,
  UserX,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  ScanSearch,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Server,
  CreditCard,
  History,
} from "lucide-react";
import { ActivityCategory } from "./api/types";

export interface ActivityFormat {
  label: string;
  description: string;
  category: ActivityCategory | "other";
  icon: LucideIcon;
}

/**
 * Centralized action-key -> display formatter for the Activity page.
 * Mirrors src/audit/audit-actions.ts's ACTIVITY_CATEGORY_ACTIONS exactly —
 * every key here is a real, already-audited backend action, never invented.
 */
const ACTIVITY_FORMAT: Record<string, ActivityFormat> = {
  "asset.created": { label: "Asset added", description: "A new asset was added.", category: "assets", icon: Server },
  "asset.verified": { label: "Asset ownership verified", description: "Ownership verification succeeded.", category: "security", icon: ShieldCheck },
  "asset.verification_failed": {
    label: "Asset verification attempt failed",
    description: "An ownership verification attempt did not succeed.",
    category: "security",
    icon: ShieldAlert,
  },
  "asset.revoked": { label: "Asset ownership revoked", description: "An asset's ownership was revoked.", category: "security", icon: ShieldOff },
  "asset.reverification_warning": {
    label: "Re-verification warning",
    description: "A scheduled re-check found a possible ownership issue.",
    category: "security",
    icon: ShieldAlert,
  },
  "asset.reverification_failed": {
    label: "Reverted to pending",
    description: "Automatic re-verification failed and the asset was reverted to pending.",
    category: "security",
    icon: ShieldOff,
  },
  "scan.requested": { label: "Scan started", description: "A scan was requested.", category: "scans", icon: ScanSearch },
  "scan.completed": { label: "Scan completed", description: "A scan finished successfully.", category: "scans", icon: CheckCircle2 },
  "scan.failed": { label: "Scan failed", description: "A scan did not complete successfully.", category: "scans", icon: XCircle },
  "report.generated": { label: "Report generated", description: "A report was generated from a completed scan.", category: "reports", icon: FileText },
  "report.downloaded": { label: "Report downloaded", description: "A report was downloaded.", category: "reports", icon: Download },
  "user.invited": { label: "Team member invited", description: "A new team member was invited.", category: "team", icon: UserPlus },
  "user.role_changed": { label: "Role changed", description: "A team member's role was changed.", category: "team", icon: UserCog },
  "user.deactivated": { label: "Team member deactivated", description: "A team member was deactivated.", category: "team", icon: UserX },
  "user.reactivated": { label: "Team member reactivated", description: "A team member was reactivated.", category: "team", icon: UserCheck },
  "billing.checkout_created": { label: "Checkout started", description: "A billing checkout session was started.", category: "billing", icon: CreditCard },
  "billing.cancellation_scheduled": {
    label: "Cancellation scheduled",
    description: "Subscription cancellation was scheduled.",
    category: "billing",
    icon: CreditCard,
  },
  "billing.cancellation_reactivated": {
    label: "Subscription reactivated",
    description: "A scheduled cancellation was reversed.",
    category: "billing",
    icon: CreditCard,
  },
  "billing.plan_change_requested": {
    label: "Plan change requested",
    description: "A subscription plan change was requested.",
    category: "billing",
    icon: CreditCard,
  },
};

/** Any action key not in the map above (a future, not-yet-vetted backend event) — never crashes, just renders generically. */
export function formatActivity(action: string): ActivityFormat {
  const known = ACTIVITY_FORMAT[action];
  if (known) return known;
  return { label: action, description: "An organization event occurred.", category: "other", icon: History };
}
