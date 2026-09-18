"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPlans, usePlanFeatures, useRemovePlanFeature } from "@/lib/admin/api/use-plans";
import { useAdminFeatures } from "@/lib/admin/api/use-features";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminFeature } from "@/lib/admin/api/types";
import { formatMoneyCents } from "@/lib/format";
import { PlanFormDialog } from "../plan-form-dialog";
import { AssignFeatureDialog } from "./assign-feature-dialog";

export function AdminPlanDetailPage({ planId }: { planId: string }) {
  const { admin } = useAdminAuth();
  const plansQuery = useAdminPlans();
  const planFeaturesQuery = usePlanFeatures(planId);
  const featuresQuery = useAdminFeatures();
  const removeFeature = useRemovePlanFeature(planId);
  const [editOpen, setEditOpen] = useState(false);
  const [assigningFeature, setAssigningFeature] = useState<AdminFeature | null>(null);

  const canWritePlan = canPerform(admin?.role, "plan.write");
  const canWriteFeature = canPerform(admin?.role, "plan_feature.write");

  if (plansQuery.isPending || planFeaturesQuery.isPending || featuresQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (plansQuery.isError) return <ErrorState error={plansQuery.error} onRetry={() => plansQuery.refetch()} />;
  if (planFeaturesQuery.isError) return <ErrorState error={planFeaturesQuery.error} onRetry={() => planFeaturesQuery.refetch()} />;
  if (featuresQuery.isError) return <ErrorState error={featuresQuery.error} onRetry={() => featuresQuery.refetch()} />;

  const plan = plansQuery.data.find((p) => p.id === planId);
  if (!plan) return <ErrorState error={new Error("Plan not found")} />;

  const assignments = new Map(planFeaturesQuery.data.map((pf) => [pf.featureId, pf]));
  const activeFeatures = featuresQuery.data.filter((f) => f.isActive || assignments.has(f.id));

  async function handleRemove(feature: AdminFeature) {
    try {
      await removeFeature.mutateAsync(feature.id);
      toast.success(`${feature.name} removed from ${plan!.name}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove feature.");
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{plan.name}</h2>
            {!plan.isActive ? <Badge variant="destructive">Archived</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">{plan.slug}</p>
        </div>
        {canWritePlan ? (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" data-icon="inline-start" />
            Edit plan
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium">Core limits & pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-sm font-medium text-foreground">
                {plan.billingMonthlyEnabled ? formatMoneyCents(plan.monthlyPriceCents, plan.currency) : "Disabled"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="text-sm font-medium text-foreground">
                {plan.billingYearlyEnabled ? formatMoneyCents(plan.yearlyPriceCents, plan.currency) : "Disabled"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scan quota</p>
              <p className="text-sm font-medium text-foreground">{plan.scanQuota}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Asset / team limit</p>
              <p className="text-sm font-medium text-foreground">
                {plan.assetLimit ?? "∞"} / {plan.teamMemberLimit ?? "∞"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trial</p>
              <p className="text-sm font-medium text-foreground">{plan.trialAvailable ? `${plan.trialDays} days` : "None"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium text-foreground">{plan.isPublic ? "Public" : "Hidden"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Featured</p>
              <p className="text-sm font-medium text-foreground">{plan.isFeatured ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-foreground">{plan.isActive ? "Active" : "Archived"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 sm:px-6">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium">Assigned product features</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Feature</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeFeatures.map((feature) => {
                    const assignment = assignments.get(feature.id);
                    return (
                      <TableRow key={feature.id}>
                        <TableCell className="font-medium text-foreground">
                          {feature.name}
                          <p className="text-xs font-normal text-muted-foreground">{feature.key}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{feature.type}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {assignment
                            ? feature.type === "BOOLEAN"
                              ? assignment.boolValue
                                ? "True"
                                : "False"
                              : `${assignment.limitValue}${feature.unit ? ` ${feature.unit}` : ""}`
                            : "Not assigned"}
                        </TableCell>
                        <TableCell>
                          {canWriteFeature ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon-sm" aria-label={`Assign ${feature.name}`} onClick={() => setAssigningFeature(feature)}>
                                <Pencil className="size-3.5" />
                              </Button>
                              {assignment ? (
                                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${feature.name}`} onClick={() => handleRemove(feature)}>
                                  <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanFormDialog plan={plan} open={editOpen} onOpenChange={setEditOpen} />

      {assigningFeature ? (
        <AssignFeatureDialog
          planId={planId}
          feature={assigningFeature}
          existing={assignments.get(assigningFeature.id)}
          open={Boolean(assigningFeature)}
          onOpenChange={(open) => !open && setAssigningFeature(null)}
        />
      ) : null}
    </div>
  );
}
