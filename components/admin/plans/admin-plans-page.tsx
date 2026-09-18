"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPlans, useArchivePlan } from "@/lib/admin/api/use-plans";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminPlan } from "@/lib/admin/api/types";
import { AdminPlansTable } from "./admin-plans-table";
import { AdminPlansListMobile } from "./admin-plans-list-mobile";
import { PlanFormDialog } from "./plan-form-dialog";

export function AdminPlansPage() {
  const { admin } = useAdminAuth();
  const plansQuery = useAdminPlans();
  const archivePlan = useArchivePlan();
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null | "new">(null);
  const [archiving, setArchiving] = useState<AdminPlan | null>(null);

  const canWrite = canPerform(admin?.role, "plan.write");

  if (plansQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={plansQuery.error} onRetry={() => plansQuery.refetch()} />
      </div>
    );
  }

  const plans = plansQuery.data;

  async function handleArchive() {
    if (!archiving) return;
    try {
      await archivePlan.mutateAsync(archiving.id);
      toast.success(`${archiving.name} archived.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to archive plan.");
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Plans</h2>
          <p className="text-sm text-muted-foreground">The commercial plan catalog — pricing, limits, and trial configuration.</p>
        </div>
        {canWrite ? (
          <Button onClick={() => setEditingPlan("new")}>
            <Plus className="size-4" data-icon="inline-start" />
            Create plan
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6">
        {plans.length === 0 ? (
          <EmptyState icon={CreditCard} title="No plans yet" compact />
        ) : (
          <>
            <AdminPlansTable plans={plans} canWrite={canWrite} onEdit={setEditingPlan} onArchive={setArchiving} />
            <AdminPlansListMobile plans={plans} canWrite={canWrite} onEdit={setEditingPlan} onArchive={setArchiving} />
          </>
        )}
      </div>

      <PlanFormDialog
        key={editingPlan === "new" || editingPlan === null ? "new" : editingPlan.id}
        plan={editingPlan === "new" || editingPlan === null ? null : editingPlan}
        open={editingPlan !== null}
        onOpenChange={(open) => !open && setEditingPlan(null)}
      />

      <ConfirmDialog
        open={Boolean(archiving)}
        onOpenChange={(open) => !open && setArchiving(null)}
        title={`Archive ${archiving?.name}?`}
        description="Archived plans can no longer be selected for new subscriptions, but existing subscribers keep working. This is not reversible from here."
        confirmLabel="Archive plan"
        destructive
        onConfirm={handleArchive}
      />
    </div>
  );
}
