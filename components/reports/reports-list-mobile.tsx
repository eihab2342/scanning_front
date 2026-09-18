import Link from "next/link";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { Report } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";
import { useDownloadReport } from "@/lib/api/use-reports";

export function ReportsListMobile({ reports, canDownload }: { reports: Report[]; canDownload: boolean }) {
  const download = useDownloadReport();

  return (
    <div className="flex flex-col gap-2 md:hidden">
      {reports.map((report) => (
        <Card key={report.id} size="sm">
          <CardContent className="flex items-start justify-between gap-2 px-4">
            <Link href={`/reports/${report.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{report.asset.hostname}</span>
              <div className="flex flex-wrap items-center gap-2">
                <ScanStatusBadge status={report.scanStatus} />
                <span className="text-xs text-muted-foreground">{formatRelative(report.createdAt)}</span>
              </div>
            </Link>
            {canDownload ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Download report"
                disabled={download.isPending}
                onClick={() => download.mutate(report.id)}
              >
                <Download className="size-4" />
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
