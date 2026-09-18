"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserX, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ManageAccessDialog } from "./manage-access-dialog";
import { useDeactivateMember, useReactivateMember } from "@/lib/api/use-team";
import { TeamMember } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

interface TeamRowActionsProps {
  member: TeamMember;
  isSelf: boolean;
  canDeactivate: boolean;
  canReactivate: boolean;
  canManageAccess: boolean;
}

/** Hidden entirely for the actor's own row — see the "self action safety" note in TeamRoleControl. Each action is gated by its own permission, not a single "canManage" boolean. */
export function TeamRowActions({ member, isSelf, canDeactivate, canReactivate, canManageAccess }: TeamRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manageAccessOpen, setManageAccessOpen] = useState(false);
  const deactivate = useDeactivateMember(member.id);
  const reactivate = useReactivateMember(member.id);

  if (isSelf) return null;

  const isActive = member.isActive;
  const canToggle = isActive ? canDeactivate : canReactivate;

  if (!canToggle && !canManageAccess) return null;

  async function handleConfirm() {
    try {
      if (isActive) {
        await deactivate.mutateAsync();
        toast.success(`${member.email} was deactivated`);
      } else {
        await reactivate.mutateAsync();
        toast.success(`${member.email} was reactivated`);
      }
    } catch (error) {
      // The backend's last-owner-protection message surfaces here verbatim.
      toast.error(error instanceof ApiError ? error.message : "Could not update this member.");
      throw error;
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        {canManageAccess ? (
          <Button variant="ghost" size="icon-sm" onClick={() => setManageAccessOpen(true)} aria-label={`Manage access for ${member.email}`}>
            <ShieldCheck className="size-4" />
          </Button>
        ) : null}
        {canToggle ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setConfirmOpen(true)}
            aria-label={isActive ? `Deactivate ${member.email}` : `Reactivate ${member.email}`}
          >
            {isActive ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
          </Button>
        ) : null}
      </div>
      {canToggle ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={isActive ? "Deactivate team member?" : "Reactivate team member?"}
          description={
            isActive
              ? `${member.email} will no longer be able to log in. Their history is preserved, and this can be undone later.`
              : `${member.email} will be able to log in again.`
          }
          confirmLabel={isActive ? "Deactivate" : "Reactivate"}
          destructive={isActive}
          onConfirm={handleConfirm}
        />
      ) : null}
      {canManageAccess ? <ManageAccessDialog member={member} open={manageAccessOpen} onOpenChange={setManageAccessOpen} /> : null}
    </>
  );
}
