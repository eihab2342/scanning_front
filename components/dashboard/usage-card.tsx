import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardOverviewView } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export function UsageCard({ overview }: { overview: DashboardOverviewView }) {
  const { scans } = overview.usage;
  const { usagePeriodStart, usagePeriodEnd } = overview.subscription;
  const percentUsed = scans.limit > 0 ? Math.min(100, Math.round((scans.used / scans.limit) * 100)) : 0;

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium">Monthly scan usage</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{scans.used}</span> / {scans.limit} scans
          </p>
          <p className="text-xs text-muted-foreground">{scans.remaining} remaining</p>
        </div>
        <Progress value={percentUsed} max={100} className="mt-2" />
        <p className="mt-2 text-xs text-muted-foreground">
          Usage period: {formatDate(usagePeriodStart)} → {formatDate(usagePeriodEnd)}
        </p>
      </CardContent>
    </Card>
  );
}
