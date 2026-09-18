"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ActivitySkeleton } from "./activity-skeleton";
import { ActivityFilters } from "./activity-filters";
import { ActivityList } from "./activity-list";
import { useActivity } from "@/lib/api/use-activity";
import { ActivityCategory } from "@/lib/api/types";

const PAGE_SIZE = 20;

export function ActivityPage() {
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [page, setPage] = useState(1);

  const activityQuery = useActivity({ page, pageSize: PAGE_SIZE, category: category === "all" ? undefined : category });

  function handleCategoryChange(next: ActivityCategory | "all") {
    setCategory(next);
    setPage(1);
  }

  if (activityQuery.isPending) return <ActivitySkeleton />;

  if (activityQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={activityQuery.error} onRetry={() => activityQuery.refetch()} />
      </div>
    );
  }

  const { items, pagination } = activityQuery.data;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col gap-1 px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Activity</h2>
        <p className="text-sm text-muted-foreground">A timeline of what&apos;s happened in your organization.</p>
      </div>

      <ActivityFilters value={category} onChange={handleCategoryChange} />

      <div className="px-4 sm:px-6">
        {items.length === 0 ? (
          <EmptyState
            icon={History}
            title={category === "all" ? "No activity yet" : "No activity in this category"}
            description={category === "all" ? "Actions your team takes will show up here." : undefined}
            compact={category !== "all"}
          />
        ) : (
          <ActivityList items={items} />
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
