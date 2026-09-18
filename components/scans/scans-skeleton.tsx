import { Skeleton } from "@/components/ui/skeleton";

export function ScansSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="scans-skeleton">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-9 w-full max-w-sm rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
