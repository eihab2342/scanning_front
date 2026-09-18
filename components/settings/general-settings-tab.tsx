"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization, useUpdateOrganization } from "@/lib/api/use-organization";
import { ApiError } from "@/lib/api/client";
import { OrganizationView } from "@/lib/api/types";

/** Owner/admin only (see settings-page.tsx) — the only genuinely editable Organization field is `name` (see the backend's UpdateOrganizationDto). */
export function GeneralSettingsTab() {
  const organizationQuery = useOrganization();

  if (organizationQuery.isPending) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (organizationQuery.isError) {
    return <ErrorState error={organizationQuery.error} onRetry={() => organizationQuery.refetch()} />;
  }

  return <GeneralSettingsForm organization={organizationQuery.data} />;
}

/** A separate component so `name` initializes from real data at mount — no effect needed to sync it in after the async load. */
function GeneralSettingsForm({ organization }: { organization: OrganizationView }) {
  const updateOrganization = useUpdateOrganization();
  const [name, setName] = useState(organization.name);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isDirty = name.trim() !== organization.name;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 200) {
      setFieldError("Organization name must be between 2 and 200 characters.");
      return;
    }

    try {
      // Only `name` is ever sent — never a forbidden field like id/slug/suspendedAt.
      await updateOrganization.mutateAsync({ name: trimmed });
      toast.success("Organization name updated");
    } catch {
      // Surfaced below via updateOrganization.error.
    }
  }

  const submitError = updateOrganization.error instanceof ApiError ? updateOrganization.error.message : null;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Basic information about your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(fieldError)}>
            <FieldLabel htmlFor="org-name">Organization name</FieldLabel>
            <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(fieldError)} />
            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Workspace URL</FieldLabel>
            <Input value={organization.slug} disabled readOnly />
            <FieldDescription>Your workspace identifier — this can&apos;t be changed.</FieldDescription>
          </Field>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || updateOrganization.isPending}>
              {updateOrganization.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
