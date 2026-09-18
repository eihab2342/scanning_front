"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminFeatures, useArchiveFeature } from "@/lib/admin/api/use-features";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminFeature } from "@/lib/admin/api/types";
import { AdminFeaturesTable } from "./admin-features-table";
import { AdminFeaturesListMobile } from "./admin-features-list-mobile";
import { FeatureFormDialog } from "./feature-form-dialog";

export function AdminFeaturesPage() {
  const { admin } = useAdminAuth();
  const featuresQuery = useAdminFeatures();
  const archiveFeature = useArchiveFeature();
  const [editingFeature, setEditingFeature] = useState<AdminFeature | null | "new">(null);
  const [archiving, setArchiving] = useState<AdminFeature | null>(null);

  const canWrite = canPerform(admin?.role, "feature.write");

  if (featuresQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (featuresQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={featuresQuery.error} onRetry={() => featuresQuery.refetch()} />
      </div>
    );
  }

  const features = featuresQuery.data;

  async function handleArchive() {
    if (!archiving) return;
    try {
      await archiveFeature.mutateAsync(archiving.id);
      toast.success(`${archiving.name} archived.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to archive feature.");
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Features</h2>
          <p className="text-sm text-muted-foreground">The product feature/entitlement catalog. Assign values to plans from a plan&apos;s detail page.</p>
        </div>
        {canWrite ? (
          <Button onClick={() => setEditingFeature("new")}>
            <Plus className="size-4" data-icon="inline-start" />
            Create feature
          </Button>
        ) : null}
      </div>

      <div className="px-4 sm:px-6">
        {features.length === 0 ? (
          <EmptyState icon={Blocks} title="No features yet" compact />
        ) : (
          <>
            <AdminFeaturesTable features={features} canWrite={canWrite} onEdit={setEditingFeature} onArchive={setArchiving} />
            <AdminFeaturesListMobile features={features} canWrite={canWrite} onEdit={setEditingFeature} onArchive={setArchiving} />
          </>
        )}
      </div>

      <FeatureFormDialog
        feature={editingFeature === "new" || editingFeature === null ? null : editingFeature}
        open={editingFeature !== null}
        onOpenChange={(open) => !open && setEditingFeature(null)}
      />

      <ConfirmDialog
        open={Boolean(archiving)}
        onOpenChange={(open) => !open && setArchiving(null)}
        title={`Archive ${archiving?.name}?`}
        description="Archived features resolve to denied/absent for every plan, regardless of any existing PlanFeature value on file."
        confirmLabel="Archive feature"
        destructive
        onConfirm={handleArchive}
      />
    </div>
  );
}
