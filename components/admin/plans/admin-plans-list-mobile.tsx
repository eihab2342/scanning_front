import Link from "next/link";
import { Archive, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPlan } from "@/lib/admin/api/types";
import { formatMoneyCents } from "@/lib/format";

interface AdminPlansListMobileProps {
  plans: AdminPlan[];
  canWrite: boolean;
  onEdit: (plan: AdminPlan) => void;
  onArchive: (plan: AdminPlan) => void;
}

export function AdminPlansListMobile({ plans, canWrite, onEdit, onArchive }: AdminPlansListMobileProps) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {plans.map((plan) => (
        <Card key={plan.id} size="sm">
          <CardContent className="flex items-start justify-between gap-2 px-4">
            <Link href={`/admin/plans/${plan.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{plan.name}</span>
              <span className="text-xs text-muted-foreground">
                {plan.billingMonthlyEnabled ? formatMoneyCents(plan.monthlyPriceCents, plan.currency) : "—"} / mo
              </span>
              <div className="flex flex-wrap gap-1">
                {!plan.isActive ? <Badge variant="destructive">Archived</Badge> : <Badge variant="outline">Active</Badge>}
                {plan.isPublic ? <Badge variant="secondary">Public</Badge> : null}
              </div>
            </Link>
            {canWrite ? (
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${plan.name}`} onClick={() => onEdit(plan)}>
                  <Pencil className="size-3.5" />
                </Button>
                {plan.isActive ? (
                  <Button variant="ghost" size="icon-sm" aria-label={`Archive ${plan.name}`} onClick={() => onArchive(plan)}>
                    <Archive className="size-3.5 text-destructive" />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
