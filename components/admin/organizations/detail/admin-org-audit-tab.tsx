"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/admin/common/pagination-bar";
import { AuditLogTable } from "@/components/admin/audit/audit-log-table";
import { AuditLogListMobile } from "@/components/admin/audit/audit-log-list-mobile";
import { useAdminAuditLog } from "@/lib/admin/api/use-audit";

export function AdminOrgAuditTab({ organizationId }: { organizationId: string }) {
  const [page, setPage] = useState(1);
  const auditQuery = useAdminAuditLog({ organizationId, page, pageSize: 15 });

  if (auditQuery.isPending) return <Skeleton className="h-64 rounded-lg" />;
  if (auditQuery.isError) return <ErrorState error={auditQuery.error} onRetry={() => auditQuery.refetch()} />;
  if (auditQuery.data.items.length === 0) return <EmptyState icon={ScrollText} title="No administrative actions recorded for this organization" compact />;

  return (
    <div className="flex flex-col gap-3">
      <AuditLogTable entries={auditQuery.data.items} showOrganization={false} />
      <AuditLogListMobile entries={auditQuery.data.items} showOrganization={false} />
      <PaginationBar pagination={auditQuery.data.pagination} onPageChange={setPage} />
    </div>
  );
}
