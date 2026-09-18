"use client";

import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useChangeMemberRole } from "@/lib/api/use-team";
import { TeamMember, Role } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { assignableRoles, roleLabel } from "@/lib/role";

/**
 * Interactive only for someone with team.change_role acting on someone
 * else's row — self-role-changes and a caller without the permission
 * always render as a plain label, matching the "self action safety" and
 * "viewer mutation controls hidden" requirements without needing any new
 * backend rule.
 */
export function TeamRoleControl({ member, actorRole, canChangeRole, isSelf }: { member: TeamMember; actorRole: Role; canChangeRole: boolean; isSelf: boolean }) {
  const changeRole = useChangeMemberRole(member.id);

  if (!canChangeRole || isSelf) {
    return <span className="text-sm text-foreground">{roleLabel(member.role)}</span>;
  }

  const options = assignableRoles(actorRole);

  async function handleSelect(role: Role) {
    if (role === member.role) return;
    try {
      await changeRole.mutateAsync({ role });
      toast.success(`${member.email}'s role is now ${roleLabel(role)}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not change this member's role.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1 px-2" disabled={changeRole.isPending}>
            {roleLabel(member.role)}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        {options.map((role) => (
          <DropdownMenuItem key={role} onClick={() => handleSelect(role)} disabled={role === member.role}>
            {roleLabel(role)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
