import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionStatusBadge } from "@/components/common/status-badge";
import { PlatformHealth } from "@/lib/admin/api/types";
import { SubscriptionStatus } from "@/lib/api/types";

const STATUSES: SubscriptionStatus[] = ["trialing", "active", "past_due", "cancelled"];

export function AdminSubscriptionsBreakdownCard({ health }: { health: PlatformHealth }) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium">Subscriptions by status</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="flex flex-col divide-y divide-border">
          {STATUSES.map((status) => (
            <li key={status} className="flex items-center justify-between gap-2 py-2 text-sm">
              <SubscriptionStatusBadge status={status} />
              <span className="font-medium text-foreground">{health.subscriptions[status] ?? 0}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
