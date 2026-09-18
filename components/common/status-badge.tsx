import { CheckCircle2, Circle, XCircle, Loader2, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { OwnershipStatus, ScanStatus, SubscriptionStatus } from "@/lib/api/types";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",
};

function BaseBadge({ tone, icon: Icon, label }: { tone: Tone; icon: React.ElementType; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

const ASSET_STATUS: Record<OwnershipStatus, { tone: Tone; icon: React.ElementType; label: string }> = {
  verified: { tone: "success", icon: CheckCircle2, label: "Verified" },
  pending: { tone: "warning", icon: Clock, label: "Pending verification" },
  revoked: { tone: "danger", icon: XCircle, label: "Revoked" },
};

export function AssetStatusBadge({ status }: { status: OwnershipStatus }) {
  const config = ASSET_STATUS[status];
  return <BaseBadge {...config} />;
}

const SCAN_STATUS: Record<ScanStatus, { tone: Tone; icon: React.ElementType; label: string }> = {
  queued: { tone: "neutral", icon: Circle, label: "Queued" },
  running: { tone: "info", icon: Loader2, label: "Running" },
  completed: { tone: "success", icon: CheckCircle2, label: "Completed" },
  failed: { tone: "danger", icon: XCircle, label: "Failed" },
  cancelled: { tone: "neutral", icon: Ban, label: "Cancelled" },
};

export function ScanStatusBadge({ status }: { status: ScanStatus }) {
  const config = SCAN_STATUS[status];
  return <BaseBadge {...config} />;
}

const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { tone: Tone; icon: React.ElementType; label: string }> = {
  active: { tone: "success", icon: CheckCircle2, label: "Active" },
  trialing: { tone: "info", icon: Clock, label: "Trial" },
  past_due: { tone: "warning", icon: Clock, label: "Past due" },
  cancelled: { tone: "neutral", icon: XCircle, label: "Cancelled" },
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = SUBSCRIPTION_STATUS[status];
  return <BaseBadge {...config} />;
}

export function MemberStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? <BaseBadge tone="success" icon={CheckCircle2} label="Active" /> : <BaseBadge tone="neutral" icon={Circle} label="Inactive" />;
}
