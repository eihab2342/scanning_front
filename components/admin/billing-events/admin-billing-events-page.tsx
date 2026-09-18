"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/admin/common/pagination-bar";
import { BillingEventsTable } from "./billing-events-table";
import { BillingEventsListMobile } from "./billing-events-list-mobile";
import { useAdminBillingEvents } from "@/lib/admin/api/use-billing-events";
import { BillingEventStatus } from "@/lib/admin/api/types";

const STATUS_FILTERS: Array<{ value: BillingEventStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "processed", label: "Processed" },
  { value: "failed", label: "Failed" },
];

export function AdminBillingEventsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as BillingEventStatus | null;
  const [status, setStatus] = useState<BillingEventStatus | "all">(initialStatus ?? "all");
  const [page, setPage] = useState(1);

  const eventsQuery = useAdminBillingEvents({ status: status === "all" ? undefined : status, page, pageSize: 25 });

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Billing events</h2>
        <p className="text-sm text-muted-foreground">The webhook-processing ledger (Stripe and Kashier), platform-wide.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            variant={status === filter.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">
        {eventsQuery.isPending ? (
          <Skeleton className="h-80 rounded-lg" />
        ) : eventsQuery.isError ? (
          <ErrorState error={eventsQuery.error} onRetry={() => eventsQuery.refetch()} />
        ) : eventsQuery.data.items.length === 0 ? (
          <EmptyState icon={Receipt} title="No billing events match this filter" compact />
        ) : (
          <>
            <BillingEventsTable events={eventsQuery.data.items} />
            <BillingEventsListMobile events={eventsQuery.data.items} />
          </>
        )}
      </div>

      {eventsQuery.data ? <PaginationBar pagination={eventsQuery.data.pagination} onPageChange={setPage} /> : null}
    </div>
  );
}
