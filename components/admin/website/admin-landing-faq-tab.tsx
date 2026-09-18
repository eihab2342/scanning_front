"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLandingFaq, useCreateLandingFaq, useUpdateLandingFaq, useRemoveLandingFaq } from "@/lib/admin/api/use-content";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminLandingFaqItem } from "@/lib/admin/api/types";

function FaqFormDialog({ item, open, onOpenChange }: { item: AdminLandingFaqItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const createFaq = useCreateLandingFaq();
  const updateFaq = useUpdateLandingFaq(item?.id ?? "");
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));

  function handleOpenChange(next: boolean) {
    if (next) {
      setQuestion(item?.question ?? "");
      setAnswer(item?.answer ?? "");
      setSortOrder(String(item?.sortOrder ?? 0));
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto = { question, answer, sortOrder: Number(sortOrder) || 0 };
    try {
      if (item) await updateFaq.mutateAsync(dto);
      else await createFaq.mutateAsync(dto);
      toast.success(item ? "FAQ item updated." : "FAQ item created.");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save FAQ item.");
    }
  }

  const isPending = createFaq.isPending || updateFaq.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit FAQ item" : "Create FAQ item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="faq-question">Question</FieldLabel>
            <Textarea id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} required maxLength={200} className="min-h-14" />
          </Field>
          <Field>
            <FieldLabel htmlFor="faq-answer">Answer (Markdown)</FieldLabel>
            <Textarea id="faq-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required maxLength={4000} className="min-h-28 font-mono text-sm" />
          </Field>
          <Field>
            <FieldLabel htmlFor="faq-sort">Sort order</FieldLabel>
            <input
              id="faq-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            />
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

function FaqRow({ item, canWrite, onEdit, onDelete }: { item: AdminLandingFaqItem; canWrite: boolean; onEdit: () => void; onDelete: () => void }) {
  const updateFaq = useUpdateLandingFaq(item.id);

  async function toggleActive() {
    try {
      await updateFaq.mutateAsync({ isActive: !item.isActive });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update FAQ item.");
    }
  }

  return (
    <Card className="py-3">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{item.question}</p>
            {!item.isActive ? <Badge variant="destructive">Inactive</Badge> : null}
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">{item.answer}</p>
        </div>
        {canWrite ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={toggleActive} disabled={updateFaq.isPending}>
              {item.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Edit FAQ item" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete FAQ item" onClick={onDelete}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminLandingFaqTab() {
  const { admin } = useAdminAuth();
  const faqQuery = useAdminLandingFaq();
  const removeFaq = useRemoveLandingFaq();
  const canWrite = canPerform(admin?.role, "content.manage");
  const [editing, setEditing] = useState<AdminLandingFaqItem | null | "new">(null);
  const [deleting, setDeleting] = useState<AdminLandingFaqItem | null>(null);

  if (faqQuery.isPending) return <Skeleton className="h-64 rounded-lg" />;
  if (faqQuery.isError) return <ErrorState error={faqQuery.error} onRetry={() => faqQuery.refetch()} />;

  const items = faqQuery.data;

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeFaq.mutateAsync(deleting.id);
      toast.success("FAQ item removed.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove FAQ item.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canWrite ? (
        <div>
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" data-icon="inline-start" />
            Create FAQ item
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQ items yet" compact />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FaqRow key={item.id} item={item} canWrite={canWrite} onEdit={() => setEditing(item)} onDelete={() => setDeleting(item)} />
          ))}
        </div>
      )}

      <FaqFormDialog item={editing === "new" || editing === null ? null : editing} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete FAQ item?"
        description="This removes the item from the landing page's FAQ for good."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
