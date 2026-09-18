import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="settings-skeleton">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-64 max-w-lg rounded-lg" />
    </div>
  );
}
