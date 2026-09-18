import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { DashboardOverviewView } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";

export function RecentActivityCard({ overview }: { overview: DashboardOverviewView }) {
  const items = overview.recentActivity;

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {items.length === 0 ? (
          <EmptyState icon={History} title="No recent activity" description="No recent organization activity." compact />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((item, index) => (
              <li key={`${item.action}-${item.createdAt}-${index}`} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-foreground">{item.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
