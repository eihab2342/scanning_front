import { Card, CardContent } from "@/components/ui/card";
import { PlatformHealth } from "@/lib/admin/api/types";

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="px-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AdminMetricsRow({ health }: { health: PlatformHealth }) {
  const { organizations, subscriptions, plans, queue } = health;
  const activeSubs = (subscriptions.active ?? 0) + (subscriptions.trialing ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4">
      <MetricCard label="Organizations" value={String(organizations.total)} sub={`${organizations.suspended} suspended`} />
      <MetricCard label="Active subscriptions" value={String(activeSubs)} sub={`${subscriptions.past_due} past due, ${subscriptions.cancelled} cancelled`} />
      <MetricCard label="Plans" value={String(plans.total)} sub={`${plans.active} active`} />
      <MetricCard label="Scan queue" value={String(queue.waiting + queue.active)} sub={`${queue.failed} failed jobs`} />
    </div>
  );
}
