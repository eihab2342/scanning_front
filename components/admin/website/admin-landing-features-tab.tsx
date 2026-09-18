"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Blocks, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminLandingFeatures,
  useCreateLandingFeature,
  useUpdateLandingFeature,
  useRemoveLandingFeature,
} from "@/lib/admin/api/use-content";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminLandingFeature, LandingSection } from "@/lib/admin/api/types";

const ICON_OPTIONS = ["ShieldCheck", "FileCheck2", "Gauge", "Users", "Activity", "FileText", "ShieldAlert"];

function FeatureFormDialog({
  section,
  itemLabel,
  feature,
  open,
  onOpenChange,
}: {
  section: LandingSection;
  itemLabel: string;
  feature: AdminLandingFeature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createFeature = useCreateLandingFeature();
  const updateFeature = useUpdateLandingFeature(feature?.id ?? "");
  const [title, setTitle] = useState(feature?.title ?? "");
  const [description, setDescription] = useState(feature?.description ?? "");
  const [icon, setIcon] = useState(feature?.icon ?? ICON_OPTIONS[0]);
  const [sortOrder, setSortOrder] = useState(String(feature?.sortOrder ?? 0));

  function handleOpenChange(next: boolean) {
    if (next) {
      setTitle(feature?.title ?? "");
      setDescription(feature?.description ?? "");
      setIcon(feature?.icon ?? ICON_OPTIONS[0]);
      setSortOrder(String(feature?.sortOrder ?? 0));
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (feature) await updateFeature.mutateAsync({ title, description, icon, sortOrder: Number(sortOrder) || 0 });
      else await createFeature.mutateAsync({ section, title, description, icon, sortOrder: Number(sortOrder) || 0 });
      toast.success(feature ? `${itemLabel} updated.` : `${itemLabel} created.`);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save item.");
    }
  }

  const isPending = createFeature.isPending || updateFeature.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{feature ? `Edit ${itemLabel}` : `Create ${itemLabel}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="feature-title">Title</FieldLabel>
            <Input id="feature-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} />
          </Field>
          <Field>
            <FieldLabel htmlFor="feature-description">Description</FieldLabel>
            <Textarea id="feature-description" value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={300} />
          </Field>
          <Field>
            <FieldLabel htmlFor="feature-icon">Icon</FieldLabel>
            <select
              id="feature-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {ICON_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="feature-sort">Sort order</FieldLabel>
            <Input id="feature-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({
  feature,
  canWrite,
  onEdit,
  onDelete,
}: {
  feature: AdminLandingFeature;
  canWrite: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const updateFeature = useUpdateLandingFeature(feature.id);

  async function toggleActive() {
    try {
      await updateFeature.mutateAsync({ isActive: !feature.isActive });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update feature.");
    }
  }

  return (
    <Card className="py-3">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{feature.title}</p>
            {!feature.isActive ? <Badge variant="destructive">Inactive</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>
        {canWrite ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={toggleActive} disabled={updateFeature.isPending}>
              {feature.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${feature.title}`} onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${feature.title}`} onClick={onDelete}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminLandingFeaturesTab({
  section,
  itemLabel,
  emptyLabel,
}: {
  section: LandingSection;
  itemLabel: string;
  emptyLabel: string;
}) {
  const { admin } = useAdminAuth();
  const featuresQuery = useAdminLandingFeatures();
  const removeFeature = useRemoveLandingFeature();
  const canWrite = canPerform(admin?.role, "content.manage");
  const [editing, setEditing] = useState<AdminLandingFeature | null | "new">(null);
  const [deleting, setDeleting] = useState<AdminLandingFeature | null>(null);

  if (featuresQuery.isPending) return <Skeleton className="h-64 rounded-lg" />;
  if (featuresQuery.isError) return <ErrorState error={featuresQuery.error} onRetry={() => featuresQuery.refetch()} />;

  const features = featuresQuery.data.filter((f) => f.section === section);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeFeature.mutateAsync(deleting.id);
      toast.success(`${deleting.title} removed.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove item.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canWrite ? (
        <div>
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" data-icon="inline-start" />
            Create {itemLabel}
          </Button>
        </div>
      ) : null}

      {features.length === 0 ? (
        <EmptyState icon={Blocks} title={emptyLabel} compact />
      ) : (
        <div className="flex flex-col gap-2">
          {features.map((feature) => (
            <FeatureRow key={feature.id} feature={feature} canWrite={canWrite} onEdit={() => setEditing(feature)} onDelete={() => setDeleting(feature)} />
          ))}
        </div>
      )}

      <FeatureFormDialog
        section={section}
        itemLabel={itemLabel}
        feature={editing === "new" || editing === null ? null : editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.title}?`}
        description="This removes the item from the landing page for good."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
