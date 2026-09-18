"use client";

import Link from "next/link";
import { ArrowLeft, Download, ScanSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport, useDownloadReport } from "@/lib/api/use-reports";
import { usePermissions } from "@/lib/auth/permissions-context";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

export function ReportDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="report-detail-skeleton">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

export function ReportDetailPage({ id }: { id: string }) {
  const { can } = usePermissions();
  const reportQuery = useReport(id);
  const download = useDownloadReport();

  if (reportQuery.isPending) return <ReportDetailSkeleton />;

  if (reportQuery.isError) {
    const notFound = reportQuery.error instanceof ApiError && reportQuery.error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState
          error={notFound ? new ApiError(404, "This report doesn't exist, or you don't have access to it.") : reportQuery.error}
          onRetry={notFound ? undefined : () => reportQuery.refetch()}
        />
      </div>
    );
  }

  const report = reportQuery.data;

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <Link href="/reports" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to reports
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{report.asset.hostname}</h2>
          <div className="mt-1 flex items-center gap-2">
            <ScanStatusBadge status={report.scanStatus} />
            <span className="text-sm text-muted-foreground">Generated {formatDateTime(report.createdAt)}</span>
          </div>
        </div>
        {can("reports.download") ? (
          <Button onClick={() => download.mutate(report.id)} disabled={download.isPending}>
            <Download className="size-4" data-icon="inline-start" />
            {download.isPending ? "Downloading…" : "Download"}
          </Button>
        ) : null}
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Report information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Asset</p>
              <p className="text-sm text-foreground">{report.asset.hostname}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Generated</p>
              <p className="text-sm text-foreground">{formatDateTime(report.createdAt)}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This report summarizes the associated scan. Detailed vulnerability findings are not yet available — in-depth scanning engine results are
            planned for a future release. Download the report for the full summary.
          </p>

          <div>
            <Button variant="outline" nativeButton={false} render={<Link href={`/scans/${report.scanId}`} />}>
              <ScanSearch className="size-4" data-icon="inline-start" />
              View Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
