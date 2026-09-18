import Link from "next/link";
import { Archive, Pencil } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPlan } from "@/lib/admin/api/types";
import { formatMoneyCents } from "@/lib/format";

interface AdminPlansTableProps {
  plans: AdminPlan[];
  canWrite: boolean;
  onEdit: (plan: AdminPlan) => void;
  onArchive: (plan: AdminPlan) => void;
}

export function AdminPlansTable({ plans, canWrite, onEdit, onArchive }: AdminPlansTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Plan</TableHead>
            <TableHead>Monthly</TableHead>
            <TableHead>Yearly</TableHead>
            <TableHead>Scan quota</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/plans/${plan.id}`} className="hover:underline">
                  {plan.name}
                </Link>
                <p className="text-xs font-normal text-muted-foreground">{plan.slug}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {plan.billingMonthlyEnabled ? formatMoneyCents(plan.monthlyPriceCents, plan.currency) : "Disabled"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {plan.billingYearlyEnabled ? formatMoneyCents(plan.yearlyPriceCents, plan.currency) : "Disabled"}
              </TableCell>
              <TableCell className="text-muted-foreground">{plan.scanQuota}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {!plan.isActive ? <Badge variant="destructive">Archived</Badge> : <Badge variant="outline">Active</Badge>}
                  {plan.isPublic ? <Badge variant="secondary">Public</Badge> : null}
                  {plan.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                </div>
              </TableCell>
              <TableCell>
                {canWrite ? (
                  <div className="flex justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
