"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ReportsSkeleton } from "./reports-skeleton";
import { ReportsTable } from "./reports-table";
import { ReportsListMobile } from "./reports-list-mobile";
import { useReports } from "@/lib/api/use-reports";
import { usePermissions } from "@/lib/auth/permissions-context";

export function ReportsPage() {
  const { can } = usePermissions();
  const canDownload = can("reports.download");
  const reportsQuery = useReports();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const reports = reportsQuery.data ?? [];
    if (!search) return reports;
    return reports.filter((r) => r.asset.hostname.toLowerCase().includes(search.toLowerCase()));
  }, [reportsQuery.data, search]);

  if (reportsQuery.isPending) return <ReportsSkeleton />;

  if (reportsQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={reportsQuery.error} onRetry={() => reportsQuery.refetch()} />
      </div>
    );
  }

  const reports = reportsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">Reports generated from your completed scans.</p>
      </div>

      {reports.length === 0 ? (
        <div className="px-4 sm:px-6">
          <EmptyState icon={FileText} title="No reports yet" description="Reports will appear here after eligible scans complete." />
        </div>
      ) : (
        <>
          <div className="px-4 sm:px-6">
            <Input placeholder="Search by hostname…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
          <div className="px-4 sm:px-6">
            {filtered.length === 0 ? (
              <EmptyState icon={FileText} title="No reports match your search" compact />
            ) : (
              <>
                <ReportsTable reports={filtered} canDownload={canDownload} />
                <ReportsListMobile reports={filtered} canDownload={canDownload} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
