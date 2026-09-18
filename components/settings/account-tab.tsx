"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { useCurrentUser } from "@/lib/api/use-profile";
import { roleLabel } from "@/lib/role";
import { formatDate } from "@/lib/format";

/**
 * Read-only by design: the User model has no editable profile fields
 * beyond email (see prisma/schema.prisma), and changing email has real
 * account-recovery/security implications the backend has no verification
 * flow for yet — see saas-handoff.md and this phase's brief. Rather than
 * bolt on an unverified email-change flow, this tab documents the
 * limitation instead of quietly implementing something unsafe.
 */
export function AccountTab() {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isPending) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (currentUserQuery.isError) {
    return <ErrorState error={currentUserQuery.error} onRetry={() => currentUserQuery.refetch()} />;
  }

  const me = currentUserQuery.data;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>My account</CardTitle>
        <CardDescription>Your personal account details.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="account-email">Email</FieldLabel>
          <Input id="account-email" value={me.email} disabled readOnly />
          <FieldDescription>Changing your email isn&apos;t supported yet — contact an organization owner if this needs to change.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <Input value={roleLabel(me.role)} disabled readOnly />
        </Field>

        <Field>
          <FieldLabel>Member since</FieldLabel>
          <Input value={formatDate(me.createdAt)} disabled readOnly />
        </Field>
      </CardContent>
    </Card>
  );
}
