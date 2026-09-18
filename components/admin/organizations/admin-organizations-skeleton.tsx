import { Skeleton } from "@/components/ui/skeleton";

export function AdminOrganizationsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-9 w-full max-w-sm" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}
