import { Skeleton } from "@/components/ui/skeleton";

export function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="reports-skeleton">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
