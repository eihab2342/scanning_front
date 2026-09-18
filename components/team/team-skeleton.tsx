import { Skeleton } from "@/components/ui/skeleton";

export function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="team-skeleton">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
