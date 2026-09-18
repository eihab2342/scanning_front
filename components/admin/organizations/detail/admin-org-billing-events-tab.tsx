"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/admin/common/pagination-bar";
import { BillingEventsTable } from "@/components/admin/billing-events/billing-events-table";
import { BillingEventsListMobile } from "@/components/admin/billing-events/billing-events-list-mobile";
import { useAdminBillingEvents } from "@/lib/admin/api/use-billing-events";

export function AdminOrgBillingEventsTab({ organizationId }: { organizationId: string }) {
  const [page, setPage] = useState(1);
  const eventsQuery = useAdminBillingEvents({ organizationId, page, pageSize: 15 });

  if (eventsQuery.isPending) return <Skeleton className="h-64 rounded-lg" />;
  if (eventsQuery.isError) return <ErrorState error={eventsQuery.error} onRetry={() => eventsQuery.refetch()} />;
  if (eventsQuery.data.items.length === 0) return <EmptyState icon={Receipt} title="No billing events for this organization" compact />;

  return (
    <div className="flex flex-col gap-3">
      <BillingEventsTable events={eventsQuery.data.items} showOrganization={false} />
      <BillingEventsListMobile events={eventsQuery.data.items} showOrganization={false} />
      <PaginationBar pagination={eventsQuery.data.pagination} onPageChange={setPage} />
    </div>
  );
}
