import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/lib/admin/api/types";

export function PaginationBar({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 sm:px-6">
      <span className="text-xs text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
