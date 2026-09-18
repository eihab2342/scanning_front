import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { Scan } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";
import { formatScanDuration } from "@/lib/scan-format";

export function ScansListMobile({ scans }: { scans: Scan[] }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {scans.map((scan) => (
        <Card key={scan.id} size="sm">
          <CardContent className="px-4">
            <Link href={`/scans/${scan.id}`} className="flex flex-col gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{scan.asset.hostname}</span>
              <div className="flex flex-wrap items-center gap-2">
                <ScanStatusBadge status={scan.status} />
                <span className="text-xs text-muted-foreground">{formatScanDuration(scan.createdAt, scan.completedAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Started {formatRelative(scan.createdAt)}</span>
                {scan.hasReport ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <FileText className="size-3" />
                    Report available
                  </span>
                ) : null}
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
