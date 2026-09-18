import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BillingEventStatusBadge } from "@/components/admin/common/billing-event-status-badge";
import { AdminBillingEvent } from "@/lib/admin/api/types";
import { formatDateTime } from "@/lib/format";

export function BillingEventsTable({ events, showOrganization = true }: { events: AdminBillingEvent[]; showOrganization?: boolean }) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Provider</TableHead>
            <TableHead>Event</TableHead>
            {showOrganization ? <TableHead>Organization</TableHead> : null}
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="text-muted-foreground capitalize">{event.provider}</TableCell>
              <TableCell className="font-medium text-foreground">{event.eventType}</TableCell>
              {showOrganization ? (
                <TableCell className="text-muted-foreground">
                  {event.organization ? (
                    <Link href={`/admin/organizations/${event.organization.id}`} className="hover:underline">
                      {event.organization.name}
                    </Link>
                  ) : (
                    "Unresolved"
                  )}
                </TableCell>
              ) : null}
              <TableCell>
                <BillingEventStatusBadge status={event.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(event.receivedAt)}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{event.failureReason ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
