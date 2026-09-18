"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

function LimitRow({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const percent = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{limit === null ? `${used} (unlimited)` : `${used} / ${limit}`}</span>
      </div>
      {limit !== null ? <Progress value={percent} max={100} className="mt-1.5" /> : null}
    </div>
  );
}

export function UsagePage() {
  const overviewQuery = useDashboardOverview();

  if (overviewQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (overviewQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} />
      </div>
    );
  }

  const { usage, subscription } = overviewQuery.data;
  // Matches AssetsService's real limit enforcement exactly (countNonRevokedForOrganization) —
  // a revoked asset frees up its slot, so it must not count as "used" here.
  const activeAssetCount = usage.assets.pending + usage.assets.verified;

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <p className="text-sm text-muted-foreground">{subscription.planName} plan — real-time usage against your current limits.</p>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Plan limits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4">
          <LimitRow label="Scans this period" used={usage.scans.used} limit={usage.scans.limit} />
          <LimitRow label="Assets" used={activeAssetCount} limit={usage.assets.limit} />
          <LimitRow label="Team members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} />
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Billing periods</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-4 text-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Scan usage resets</span>
            <span className="text-foreground">
              {formatDate(subscription.usagePeriodStart)} → {formatDate(subscription.usagePeriodEnd)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">{subscription.billingInterval === "yearly" ? "Yearly" : "Monthly"} billing period</span>
            <span className="text-foreground">{formatDate(subscription.currentPeriodEnd)}</span>
          </div>
          {subscription.billingInterval === "yearly" ? (
            <p className="text-xs text-muted-foreground">
              Your subscription bills yearly, but scan usage still resets monthly — the two periods are independent.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
