import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardOverviewView } from "@/lib/api/types";

const SEVERITY_ICON: Record<string, { icon: React.ElementType; className: string }> = {
  critical: { icon: AlertOctagon, className: "text-red-600 dark:text-red-400" },
  high: { icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400" },
  medium: { icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400" },
  low: { icon: Info, className: "text-blue-600 dark:text-blue-400" },
};

export function AttentionCenter({ overview }: { overview: DashboardOverviewView }) {
  const items = overview.attention;

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium">Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {items.length === 0 ? (
          <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Nothing needs your attention right now.
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => {
              const { icon: Icon, className } = SEVERITY_ICON[item.severity] ?? SEVERITY_ICON.low;
              return (
                <li key={item.type} className="flex items-start gap-2 text-sm">
                  <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden="true" />
                  <span className="text-foreground">{item.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
