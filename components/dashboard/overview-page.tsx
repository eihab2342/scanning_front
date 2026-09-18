"use client";

import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { useAuth } from "@/lib/auth/auth-context";
import { OverviewSkeleton } from "./overview-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { OverviewHeader } from "./overview-header";
import { MetricsRow } from "./metrics-row";
import { UsageCard } from "./usage-card";
import { AssetStatusCard } from "./asset-status-card";
import { RecentScansCard } from "./recent-scans-card";
import { AttentionCenter } from "./attention-center";
import { RecentActivityCard } from "./recent-activity-card";

export function OverviewPage() {
  const { user } = useAuth();
  const overviewQuery = useDashboardOverview();

  if (overviewQuery.isPending) return <OverviewSkeleton />;

  if (overviewQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} />
      </div>
    );
  }

  const overview = overviewQuery.data;
  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <OverviewHeader overview={overview} />
      <MetricsRow overview={overview} />
      <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 lg:grid-cols-2">
        <UsageCard overview={overview} />
        <AttentionCenter overview={overview} />
      </div>
      <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 lg:grid-cols-2">
        <AssetStatusCard overview={overview} />
        <RecentScansCard overview={overview} />
      </div>
      <div className="px-4 sm:px-6">
        <RecentActivityCard overview={overview} />
      </div>
    </div>
  );
}
