"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, ShieldOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminOrganizationDetail } from "@/lib/admin/api/types";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { useUnsuspendOrganization } from "@/lib/admin/api/use-organizations";
import { ApiError } from "@/lib/admin/api/client";
import { SuspendOrganizationDialog } from "./suspend-organization-dialog";
import { ImpersonateDialog } from "./impersonate-dialog";

export function AdminOrgHeader({ organization }: { organization: AdminOrganizationDetail }) {
  const { admin } = useAdminAuth();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const unsuspend = useUnsuspendOrganization(organization.id);

  const canSuspend = canPerform(admin?.role, "organization.suspend");
  const canUnsuspend = canPerform(admin?.role, "organization.unsuspend");
  const canImpersonate = canPerform(admin?.role, "organization.impersonate");
  const isSuspended = Boolean(organization.suspendedAt);

  async function handleUnsuspend() {
    try {
      await unsuspend.mutateAsync();
      toast.success(`${organization.name} is no longer suspended.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to unsuspend organization.");
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{organization.name}</h2>
          {isSuspended ? <Badge variant="destructive">Suspended</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{organization.slug}</p>
        {isSuspended && organization.suspendedReason ? (
          <p className="mt-1 text-sm text-destructive">Reason: {organization.suspendedReason}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {canImpersonate ? (
          <Button variant="outline" size="sm" onClick={() => setImpersonateOpen(true)}>
            <Eye className="size-3.5" data-icon="inline-start" />
            Impersonate
          </Button>
        ) : null}
        {isSuspended
          ? canUnsuspend && (
              <Button variant="outline" size="sm" onClick={handleUnsuspend} disabled={unsuspend.isPending}>
                <ShieldCheck className="size-3.5" data-icon="inline-start" />
                {unsuspend.isPending ? "Unsuspending…" : "Unsuspend"}
              </Button>
            )
          : canSuspend && (
              <Button variant="destructive" size="sm" onClick={() => setSuspendOpen(true)}>
                <ShieldOff className="size-3.5" data-icon="inline-start" />
                Suspend
              </Button>
            )}
      </div>

      <SuspendOrganizationDialog organizationId={organization.id} organizationName={organization.name} open={suspendOpen} onOpenChange={setSuspendOpen} />
      <ImpersonateDialog organizationId={organization.id} organizationName={organization.name} open={impersonateOpen} onOpenChange={setImpersonateOpen} />
    </div>
  );
}
