import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
      </div>
    </div>
  );
}
