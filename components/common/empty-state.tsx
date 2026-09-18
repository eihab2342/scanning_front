import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center",
        compact ? "gap-1.5 px-4 py-6" : "gap-2 px-6 py-12",
        className,
      )}
    >
      <Icon className={cn("text-muted-foreground", compact ? "size-5" : "size-8")} aria-hidden="true" />
      <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
