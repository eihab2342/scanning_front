import Link from "next/link";
import { FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { Scan } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";
import { formatScanDuration } from "@/lib/scan-format";

export function ScansTable({ scans }: { scans: Scan[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Report</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow key={scan.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/scans/${scan.id}`} className="hover:underline">
                  {scan.asset.hostname}
                </Link>
              </TableCell>
              <TableCell>
                <ScanStatusBadge status={scan.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(scan.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatScanDuration(scan.createdAt, scan.completedAt)}</TableCell>
              <TableCell>
                {scan.hasReport && scan.reportId ? (
                  <Link href={`/reports/${scan.reportId}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <FileText className="size-3" />
                    View
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/scans/${scan.id}`} />}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
