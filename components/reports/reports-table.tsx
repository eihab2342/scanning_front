import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { Report } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";
import { useDownloadReport } from "@/lib/api/use-reports";

export function ReportsTable({ reports, canDownload }: { reports: Report[]; canDownload: boolean }) {
  const download = useDownloadReport();

  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead>Scan status</TableHead>
            <TableHead>Generated</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/reports/${report.id}`} className="hover:underline">
                  {report.asset.hostname}
                </Link>
              </TableCell>
              <TableCell>
                <ScanStatusBadge status={report.scanStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(report.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={`/reports/${report.id}`} />} aria-label="View report">
                    <Eye className="size-4" />
                  </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
