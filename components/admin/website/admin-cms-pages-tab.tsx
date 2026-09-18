"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCmsPages, useUpdateCmsPage } from "@/lib/admin/api/use-content";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminCmsPage } from "@/lib/admin/api/types";

function ToggleField({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-input" />
      {label}
    </label>
  );
}

function CmsPageEditor({ page, canWrite }: { page: AdminCmsPage; canWrite: boolean }) {
  const updatePage = useUpdateCmsPage(page.slug);
  const [title, setTitle] = useState(page.title);
  const [contentMarkdown, setContentMarkdown] = useState(page.contentMarkdown);
  const [isPublished, setIsPublished] = useState(page.isPublished);

  async function handleSave() {
    try {
      await updatePage.mutateAsync({ title, contentMarkdown, isPublished });
      toast.success(`${page.title} saved.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save page.");
    }
  }

  return (
    <Card className="py-4">
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          /{page.slug}
          {!isPublished ? <Badge variant="destructive">Unpublished</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        <Field>
          <FieldLabel htmlFor={`${page.slug}-title`}>Title</FieldLabel>
          <Input id={`${page.slug}-title`} value={title} disabled={!canWrite} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${page.slug}-content`}>Content (Markdown)</FieldLabel>
          <Textarea
            id={`${page.slug}-content`}
            value={contentMarkdown}
            disabled={!canWrite}
            onChange={(e) => setContentMarkdown(e.target.value)}
            className="min-h-48 font-mono text-sm"
          />
        </Field>
        <ToggleField label="Published (reachable at /{slug})" checked={isPublished} disabled={!canWrite} onChange={setIsPublished} />
        {canWrite ? (
          <div>
            <Button onClick={handleSave} disabled={updatePage.isPending}>
              {updatePage.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminCmsPagesTab() {
  const { admin } = useAdminAuth();
  const pagesQuery = useAdminCmsPages();
  const canWrite = canPerform(admin?.role, "content.manage");

  if (pagesQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (pagesQuery.isError) {
    return <ErrorState error={pagesQuery.error} onRetry={() => pagesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {!canWrite ? <p className="text-xs text-muted-foreground">Your role doesn&apos;t permit editing pages.</p> : null}
      {pagesQuery.data.map((page) => (
        <CmsPageEditor key={page.slug} page={page} canWrite={canWrite} />
      ))}
    </div>
  );
}
