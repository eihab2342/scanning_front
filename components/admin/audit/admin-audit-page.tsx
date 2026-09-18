"use client";

import { useState } from "react";
import { useDeferredValue } from "react";
import { ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/admin/common/pagination-bar";
import { AuditLogTable } from "./audit-log-table";
import { AuditLogListMobile } from "./audit-log-list-mobile";
import { useAdminAuditLog } from "@/lib/admin/api/use-audit";

export function AdminAuditPage() {
  const [action, setAction] = useState("");
  const deferredAction = useDeferredValue(action);
  const [page, setPage] = useState(1);

  const auditQuery = useAdminAuditLog({ action: deferredAction || undefined, page, pageSize: 25 });

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Platform audit</h2>
        <p className="text-sm text-muted-foreground">Every platform-admin-authored action across all organizations.</p>
      </div>

      <div className="px-4 sm:px-6">
        <Input
          placeholder="Filter by action (e.g. admin.organization_suspended)…"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="px-4 sm:px-6">
        {auditQuery.isPending ? (
          <Skeleton className="h-80 rounded-lg" />
        ) : auditQuery.isError ? (
          <ErrorState error={auditQuery.error} onRetry={() => auditQuery.refetch()} />
        ) : auditQuery.data.items.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit entries match this filter" compact />
        ) : (
          <>
            <AuditLogTable entries={auditQuery.data.items} />
            <AuditLogListMobile entries={auditQuery.data.items} />
          </>
        )}
      </div>

      {auditQuery.data ? <PaginationBar pagination={auditQuery.data.pagination} onPageChange={setPage} /> : null}
    </div>
  );
}
