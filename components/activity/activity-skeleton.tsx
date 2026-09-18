import { Skeleton } from "@/components/ui/skeleton";

export function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="activity-skeleton">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
