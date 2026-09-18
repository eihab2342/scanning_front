"use client";

import { OverviewSkeleton } from "@/components/dashboard/overview-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { useAdminHealth } from "@/lib/admin/api/use-health";
import { useAdminAuditLog } from "@/lib/admin/api/use-audit";
import { useAdminBillingEvents } from "@/lib/admin/api/use-billing-events";
import { AdminMetricsRow } from "./admin-metrics-row";
import { AdminSubscriptionsBreakdownCard } from "./admin-subscriptions-breakdown-card";
import { AdminRecentActivityCard } from "./admin-recent-activity-card";
import { AdminBillingFailuresCard } from "./admin-billing-failures-card";

export function AdminOverviewPage() {
  const healthQuery = useAdminHealth();
  const activityQuery = useAdminAuditLog({ page: 1, pageSize: 8 });
  const failuresQuery = useAdminBillingEvents({ status: "failed", page: 1, pageSize: 8 });

  if (healthQuery.isPending) return <OverviewSkeleton />;

  if (healthQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={healthQuery.error} onRetry={() => healthQuery.refetch()} />
      </div>
    );
  }

  const health = healthQuery.data;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Platform overview</h2>
        <p className="text-sm text-muted-foreground">Cross-tenant health, subscriptions, and platform activity at a glance.</p>
      </div>

      <AdminMetricsRow health={health} />

      <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 lg:grid-cols-2">
        <AdminSubscriptionsBreakdownCard health={health} />
        <AdminBillingFailuresCard items={failuresQuery.data?.items ?? []} />
      </div>

      <div className="px-4 sm:px-6">
        <AdminRecentActivityCard items={activityQuery.data?.items ?? []} />
      </div>
    </div>
  );
}
