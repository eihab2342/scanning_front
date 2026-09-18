import Link from "next/link";
import { AlertOctagon, AlertTriangle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { DashboardOverviewView } from "@/lib/api/types";

type Tone = "critical" | "warning" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  critical: "border-red-600/30 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200",
  warning: "border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  info: "border-blue-600/30 bg-blue-50 text-blue-900 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200",
};

const TONE_ICON: Record<Tone, React.ElementType> = { critical: AlertOctagon, warning: AlertTriangle, info: Info };

function Banner({ tone, message, action }: { tone: Tone; message: string; action?: React.ReactNode }) {
  const Icon = TONE_ICON[tone];
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5 text-sm sm:px-6", TONE_CLASSES[tone])}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1 font-medium">{message}</p>
      {action}
    </div>
  );
}

/**
 * Commercial and administrative restrictions are represented distinctly —
 * never collapsed into one generic "inactive" banner. Organization
 * suspension (a platform-admin action) is shown first and separately from
 * every subscription/billing state, since it isn't a billing failure.
 */
export function RestrictionBanner({ overview }: { overview: DashboardOverviewView }) {
  const { organization, subscription } = overview;

  if (organization.isSuspended) {
    return (
      <Banner
        tone="critical"
        message={
          organization.suspendedReason
            ? `Your organization is suspended: ${organization.suspendedReason}`
            : "Your organization is suspended. Platform access is restricted."
        }
      />
    );
  }

  if (subscription.status === "past_due") {
    return (
      <Banner
        tone="warning"
        message="Your last payment failed. Update your billing details to avoid a service interruption."
        action={
          <Link href="/billing" className="font-semibold underline underline-offset-2">
            Update billing
          </Link>
        }
      />
    );
  }

  if (subscription.status === "cancelled") {
    return (
      <Banner
        tone="warning"
        message="Your subscription has ended. Some features may be restricted."
        action={
          <Link href="/billing" className="font-semibold underline underline-offset-2">
            Reactivate billing
          </Link>
        }
      />
    );
  }

  if (subscription.cancelAtPeriodEnd) {
    return (
      <Banner
        tone="info"
        message={`Your subscription remains active until ${formatDate(subscription.currentPeriodEnd)}, then it will end.`}
        action={
          <Link href="/billing" className="font-semibold underline underline-offset-2">
            Reactivate
          </Link>
        }
      />
    );
  }

  if (subscription.status === "trialing" && subscription.trialEndsAt) {
    return (
      <Banner
        tone="info"
        message={`You're on a trial of the ${subscription.planName} plan — it ends ${formatDate(subscription.trialEndsAt)}.`}
        action={
          <span className="inline-flex items-center gap-1 text-xs opacity-80">
            <Clock className="size-3" />
            Trial
          </span>
        }
      />
    );
  }

  return null;
}
