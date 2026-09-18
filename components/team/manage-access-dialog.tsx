"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useMemberPermissions, useUpdateMemberPermissions, useResetMemberPermissions } from "@/lib/api/use-permissions";
import { PERMISSION_CATALOG_GROUPS } from "@/lib/permissions-catalog";
import { TeamMember, Permission, OverrideEffect } from "@/lib/api/types";
import { roleLabel } from "@/lib/role";
import { ApiError } from "@/lib/api/client";

interface ManageAccessDialogProps {
  member: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EffectiveState = "default" | "allow" | "deny";

const STATE_OPTIONS: Array<{ value: EffectiveState; label: string }> = [
  { value: "default", label: "Default" },
  { value: "allow", label: "Allow" },
  { value: "deny", label: "Deny" },
];

function PermissionRow({
  label,
  isDefaultGranted,
  state,
  disabled,
  onChange,
}: {
  label: string;
  isDefaultGranted: boolean;
  state: EffectiveState;
  disabled: boolean;
  onChange: (next: EffectiveState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {state === "default"
            ? isDefaultGranted
              ? "Inherited from role — allowed"
              : "Inherited from role — not allowed"
            : state === "allow"
              ? "Custom: Allowed"
              : "Custom: Denied"}
        </span>
      </div>
      <div className="flex shrink-0 gap-1" role="group" aria-label={`${label} access`}>
        {STATE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={state === option.value ? "secondary" : "ghost"}
            disabled={disabled}
            aria-pressed={state === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * The Manage Access surface's Dialog — GET/PUT/POST /users/:id/permissions.
 * Each toggle applies immediately (one PUT per change) rather than a batch
 * "Save" — every write is already a minimal, self-contained delta (see
 * UpdateMemberPermissionsDto), so there's no unsaved-state to lose if the
 * dialog is closed mid-edit. The backend remains authoritative: an ALLOW
 * the actor isn't permitted to delegate still renders here, but the
 * mutation fails with the backend's exact reason surfaced via toast.
 */
export function ManageAccessDialog({ member, open, onOpenChange }: ManageAccessDialogProps) {
  const permissionsQuery = useMemberPermissions(member.id, open);
  const update = useUpdateMemberPermissions(member.id);
  const reset = useResetMemberPermissions(member.id);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const view = permissionsQuery.data;

  function stateFor(permission: Permission): EffectiveState {
    const override = view?.overrides.find((o) => o.permission === permission);
    return override ? override.effect : "default";
  }

  async function handleChange(permission: Permission, next: EffectiveState) {
    const effect: OverrideEffect | null = next === "default" ? null : next;
    try {
      await update.mutateAsync({ changes: [{ permission, effect }] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update this permission.");
    }
  }

  async function handleReset() {
    try {
      await reset.mutateAsync();
      toast.success(`${member.email}'s access was reset to ${roleLabel(member.role)} defaults`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not reset this member's access.");
      throw error;
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Access</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {member.email}
              <Badge variant="secondary">{roleLabel(member.role)}</Badge>
            </DialogDescription>
          </DialogHeader>

          {permissionsQuery.isPending ? (
            <div className="flex flex-col gap-2" data-testid="manage-access-loading">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : permissionsQuery.isError || !view ? (
            <p className="text-sm text-destructive">Could not load this member&apos;s access.</p>
          ) : (
            <>
              <ScrollArea className="max-h-[60vh]">
                <div className="flex flex-col gap-4 pr-3">
                  {PERMISSION_CATALOG_GROUPS.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</p>
                      <div className="flex flex-col">
                        {group.items.map((item) => (
                          <PermissionRow
                            key={item.permission}
                            label={item.label}
                            isDefaultGranted={view.roleDefaults.includes(item.permission)}
                            state={stateFor(item.permission)}
                            disabled={update.isPending || reset.isPending}
                            onChange={(next) => handleChange(item.permission, next)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetConfirmOpen(true)}
                  disabled={view.overrides.length === 0 || reset.isPending}
                >
                  <RotateCcw className="size-3.5" data-icon="inline-start" />
                  Reset to role defaults
                </Button>
                <Button type="button" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset to role defaults?"
        description={`${member.email}'s custom permission overrides will be removed, restoring the standard ${roleLabel(member.role)} access.`}
        confirmLabel="Reset"
        onConfirm={handleReset}
      />
    </>
  );
}
