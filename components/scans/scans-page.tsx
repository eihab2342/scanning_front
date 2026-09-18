"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ScansSkeleton } from "./scans-skeleton";
import { ScansTable } from "./scans-table";
import { ScansListMobile } from "./scans-list-mobile";
import { RunScanDialog } from "./run-scan-dialog";
import { useScans } from "@/lib/api/use-scans";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { usePermissions } from "@/lib/auth/permissions-context";
import { ScanStatus } from "@/lib/api/types";

const STATUS_FILTERS: Array<{ value: ScanStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export function ScansPage() {
  const { can } = usePermissions();
  const searchParams = useSearchParams();
  const overviewQuery = useDashboardOverview();

  const [status, setStatus] = useState<ScanStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [runDialogOpen, setRunDialogOpen] = useState(searchParams.get("action") === "create");

  const scansQuery = useScans({ page, pageSize: 20, status: status === "all" ? undefined : status });

  if (scansQuery.isPending || overviewQuery.isPending) return <ScansSkeleton />;

  if (scansQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={scansQuery.error} onRetry={() => scansQuery.refetch()} />
      </div>
    );
  }

  const { items, pagination } = scansQuery.data;
  const overview = overviewQuery.data;
  const isRestricted = overview
    ? overview.organization.isSuspended || overview.subscription.status === "past_due" || overview.subscription.status === "cancelled"
    : false;
  const showRunButton = can("scans.create") && !isRestricted;
  const scansUsage = overview?.usage.scans;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Scans</h2>
          {scansUsage ? (
            <p className="text-sm text-muted-foreground">
              {scansUsage.used} / {scansUsage.limit} scans used this period — {scansUsage.remaining} remaining.
            </p>
          ) : null}
        </div>
        {showRunButton ? (
          <Button onClick={() => setRunDialogOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Run Scan
          </Button>
        ) : null}
      </div>

      {items.length === 0 && status === "all" ? (
        <div className="px-4 sm:px-6">
          <EmptyState
            icon={ScanSearch}
            title="No scans yet"
            description="Verify an asset and run your first scan."
            action={
              showRunButton ? (
                <Button onClick={() => setRunDialogOpen(true)}>
                  <Plus className="size-4" data-icon="inline-start" />
                  Run Scan
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                variant={status === filter.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setStatus(filter.value);
                  setPage(1);
                }}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="px-4 sm:px-6">
            {items.length === 0 ? (
              <EmptyState icon={ScanSearch} title="No scans match this filter" compact />
            ) : (
              <>
                <ScansTable scans={items} />
                <ScansListMobile scans={items} />
              </>
            )}
          </div>

          {pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between px-4 sm:px-6">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <RunScanDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} preselectedAssetId={searchParams.get("assetId") ?? undefined} />
    </div>
  );
}
