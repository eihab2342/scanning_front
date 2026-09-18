import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BillingEventStatusBadge } from "@/components/admin/common/billing-event-status-badge";
import { AdminBillingEvent } from "@/lib/admin/api/types";
import { formatRelative } from "@/lib/format";

export function BillingEventsListMobile({ events, showOrganization = true }: { events: AdminBillingEvent[]; showOrganization?: boolean }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {events.map((event) => (
        <Card key={event.id} size="sm">
          <CardContent className="flex flex-col gap-1.5 px-4">
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                <span className="capitalize text-muted-foreground">{event.provider}</span> · {event.eventType}
              </span>
              <BillingEventStatusBadge status={event.status} />
            </div>
            {showOrganization && event.organization ? (
              <Link href={`/admin/organizations/${event.organization.id}`} className="text-xs text-muted-foreground hover:underline">
                {event.organization.name}
              </Link>
            ) : null}
            {event.failureReason ? <p className="truncate text-xs text-destructive">{event.failureReason}</p> : null}
            <span className="text-xs text-muted-foreground">{formatRelative(event.receivedAt)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
