import Link from "next/link";
import { FileText, ScanSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanStatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { DashboardOverviewView } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";

export function RecentScansCard({ overview }: { overview: DashboardOverviewView }) {
  const recent = overview.scans.recent;

  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between px-4">
        <CardTitle className="text-sm font-medium">Recent scans</CardTitle>
        <Link href="/scans" className="text-xs font-medium text-primary hover:underline">
          View all scans
        </Link>
      </CardHeader>
      <CardContent className="px-4">
        {recent.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No scans yet"
            description="Verify an asset before running your first scan."
            compact
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((scan) => (
                <TableRow key={scan.id} className="cursor-pointer">
                  <TableCell className="max-w-40 truncate font-medium text-foreground">
                    <Link href={`/scans/${scan.id}`} className="hover:underline">
                      {scan.assetValue}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ScanStatusBadge status={scan.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatRelative(scan.createdAt)}</TableCell>
                  <TableCell>
                    {scan.reportId ? (
                      <Link href={`/reports/${scan.reportId}`} aria-label="View report" className="text-muted-foreground hover:text-primary">
                        <FileText className="size-3.5" />
                      </Link>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
