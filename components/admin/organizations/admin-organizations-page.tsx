"use client";

import { useState } from "react";
import { useDeferredValue } from "react";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AdminOrganizationsSkeleton } from "./admin-organizations-skeleton";
import { AdminOrganizationsTable } from "./admin-organizations-table";
import { AdminOrganizationsListMobile } from "./admin-organizations-list-mobile";
import { useAdminOrganizations } from "@/lib/admin/api/use-organizations";
import { SubscriptionStatus } from "@/lib/api/types";

const STATUS_FILTERS: Array<{ value: SubscriptionStatus | "suspended" | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "trialing", label: "Trialing" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past due" },
  { value: "cancelled", label: "Cancelled" },
  { value: "suspended", label: "Suspended" },
];

export function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<SubscriptionStatus | "suspended" | "all">("all");
  const [page, setPage] = useState(1);

  const organizationsQuery = useAdminOrganizations({
    search: deferredSearch || undefined,
    status: status === "all" ? undefined : status,
    page,
    pageSize: 20,
  });

  if (organizationsQuery.isPending) return <AdminOrganizationsSkeleton />;

  if (organizationsQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={organizationsQuery.error} onRetry={() => organizationsQuery.refetch()} />
      </div>
    );
  }

  const { items, pagination } = organizationsQuery.data;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Organizations</h2>
        <p className="text-sm text-muted-foreground">{pagination.total} organizations on the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6">
        <Input
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
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
      </div>

      <div className="px-4 sm:px-6">
        {items.length === 0 ? (
          <EmptyState icon={Building2} title="No organizations match your filters" compact />
        ) : (
          <>
            <AdminOrganizationsTable organizations={items} />
            <AdminOrganizationsListMobile organizations={items} />
          </>
        )}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between px-4 sm:px-6">
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
