"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Loader2, RotateCcw, ScanSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useScan } from "@/lib/api/use-scans";
import { usePermissions } from "@/lib/auth/permissions-context";
import { formatDateTime } from "@/lib/format";
import { formatScanDuration } from "@/lib/scan-format";
import { ApiError } from "@/lib/api/client";

export function ScanDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="scan-detail-skeleton">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

export function ScanDetailPage({ id }: { id: string }) {
  const { can } = usePermissions();
  const scanQuery = useScan(id);

  if (scanQuery.isPending) return <ScanDetailSkeleton />;

  if (scanQuery.isError) {
    const notFound = scanQuery.error instanceof ApiError && scanQuery.error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState
          error={notFound ? new ApiError(404, "This scan doesn't exist, or you don't have access to it.") : scanQuery.error}
          onRetry={notFound ? undefined : () => scanQuery.refetch()}
        />
      </div>
    );
  }

  const scan = scanQuery.data;
  const canMutate = can("scans.create");

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <Link href="/scans" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to scans
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{scan.asset.hostname}</h2>
          <div className="mt-1 flex items-center gap-2">
            <ScanStatusBadge status={scan.status} />
            <span className="text-sm text-muted-foreground">Started {formatDateTime(scan.createdAt)}</span>
          </div>
        </div>
        {scan.hasReport && scan.reportId ? (
          <Button nativeButton={false} render={<Link href={`/reports/${scan.reportId}`} />}>
            <FileText className="size-4" data-icon="inline-start" />
            View Report
          </Button>
        ) : null}
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Started</p>
            <p className="text-sm text-foreground">{formatDateTime(scan.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            <p className="text-sm text-foreground">{scan.completedAt ? formatDateTime(scan.completedAt) : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Duration</p>
            <p className="text-sm text-foreground">{formatScanDuration(scan.createdAt, scan.completedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {scan.status === "queued" ? (
        <Card className="py-4">
          <CardContent className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <ScanSearch className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Scan queued</p>
            <p className="max-w-sm text-sm text-muted-foreground">This scan is waiting to be processed. It will start automatically.</p>
          </CardContent>
        </Card>
      ) : null}

      {scan.status === "running" ? (
        <Card className="py-4">
          <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Scan in progress</p>
            <div className="h-1.5 w-full max-w-xs animate-pulse overflow-hidden rounded-full bg-primary/40" aria-hidden="true" />
            <p className="max-w-sm text-sm text-muted-foreground">This may take a few minutes.</p>
          </CardContent>
        </Card>
      ) : null}

      {scan.status === "failed" ? (
        <Card className="py-4">
          <CardContent className="flex flex-col gap-3 px-4">
            <p className="text-sm font-medium text-foreground">Scan failed</p>
            <p className="text-sm text-muted-foreground">{scan.failureSummary ?? "This scan could not complete."}</p>
            {canMutate ? (
              <div>
                <Button nativeButton={false} render={<Link href={`/scans?assetId=${scan.asset.id}&action=create`} />}>
                  <RotateCcw className="size-4" data-icon="inline-start" />
                  Run New Scan
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {scan.status === "completed" ? (
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4">
            <p className="text-sm text-muted-foreground">
              This asset was scanned successfully. Detailed vulnerability findings are not yet available — in-depth scanning engine results are planned
              for a future release.
            </p>
            {scan.hasReport && scan.reportId ? (
              <div>
                <Button variant="outline" nativeButton={false} render={<Link href={`/reports/${scan.reportId}`} />}>
                  <FileText className="size-4" data-icon="inline-start" />
                  View Report
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
