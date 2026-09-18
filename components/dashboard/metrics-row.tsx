import { Card, CardContent } from "@/components/ui/card";
import { DashboardOverviewView } from "@/lib/api/types";

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

export function MetricsRow({ overview }: { overview: DashboardOverviewView }) {
  const { usage, subscription } = overview;

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4">
      <MetricCard label="Verified assets" value={String(usage.assets.verified)} sub={usage.assets.limit !== null ? `of ${usage.assets.limit} allowed` : "unlimited"} />
      <MetricCard label="Scans used" value={`${usage.scans.used} / ${usage.scans.limit}`} />
      <MetricCard label="Scans remaining" value={String(usage.scans.remaining)} />
      <MetricCard label="Current plan" value={subscription.planName} sub={subscription.billingInterval === "yearly" ? "Billed yearly" : "Billed monthly"} />
    </div>
  );
}
