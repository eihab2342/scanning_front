import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingEventStatus } from "@/lib/admin/api/types";

const TONE_CLASSES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
};

const CONFIG: Record<BillingEventStatus, { tone: string; icon: React.ElementType; label: string }> = {
  received: { tone: "warning", icon: Clock, label: "Received" },
  processed: { tone: "success", icon: CheckCircle2, label: "Processed" },
  failed: { tone: "danger", icon: XCircle, label: "Failed" },
};

export function BillingEventStatusBadge({ status }: { status: BillingEventStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset", TONE_CLASSES[config.tone])}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
