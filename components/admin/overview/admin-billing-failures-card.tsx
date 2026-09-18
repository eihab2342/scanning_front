import Link from "next/link";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { AdminBillingEvent } from "@/lib/admin/api/types";
import { formatRelative } from "@/lib/format";

export function AdminBillingFailuresCard({ items }: { items: AdminBillingEvent[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="text-sm font-medium">Recent billing failures</CardTitle>
        <Link href="/admin/billing-events?status=failed" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-4">
        {items.length === 0 ? (
          <EmptyState icon={Receipt} title="No recent billing failures" compact />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-foreground">{item.eventType}</span>
                  <span className="truncate text-xs text-muted-foreground">{item.organization?.name ?? "Unresolved organization"}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(item.receivedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
