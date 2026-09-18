import { AuditLogEntry } from "@/lib/api/types";
import { formatActivity } from "@/lib/audit-format";
import { formatDateTime } from "@/lib/format";

/**
 * A timeline, not a database table — one row per event, works unmodified
 * at any width, so there's no separate desktop/mobile variant here (unlike
 * AssetsTable/AssetsListMobile).
 */
export function ActivityList({ items }: { items: AuditLogEntry[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg ring-1 ring-foreground/10">
      {items.map((item) => {
        const format = formatActivity(item.action);
        const Icon = format.icon;
        return (
          <li key={item.id} className="flex items-start gap-3 bg-card px-4 py-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">{format.label}</p>
              <p className="text-xs text-muted-foreground">
                {item.actor ? item.actor.email : "System"} · {formatDateTime(item.occurredAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
