import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MemberStatusBadge } from "@/components/common/status-badge";
import { TeamRoleControl } from "./team-role-control";
import { TeamRowActions } from "./team-row-actions";
import { TeamMember, Role } from "@/lib/api/types";
import { canManageAccessFor } from "@/lib/role";
import { formatDate } from "@/lib/format";

interface TeamTableProps {
  members: TeamMember[];
  actorRole: Role;
  currentUserId: string;
  canChangeRole: boolean;
  canDeactivate: boolean;
  canReactivate: boolean;
  canManageAccess: boolean;
}

/** Desktop layout — hidden below md, where TeamListMobile takes over instead of forcing horizontal scroll. */
export function TeamTable({ members, actorRole, currentUserId, canChangeRole, canDeactivate, canReactivate, canManageAccess }: TeamTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-foreground">
                  {member.email}
                  {isSelf ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span> : null}
                </TableCell>
                <TableCell>
                  <TeamRoleControl member={member} actorRole={actorRole} canChangeRole={canChangeRole} isSelf={isSelf} />
                </TableCell>
                <TableCell>
                  <MemberStatusBadge isActive={member.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                <TableCell>
                  <TeamRowActions
                    member={member}
                    isSelf={isSelf}
                    canDeactivate={canDeactivate}
                    canReactivate={canReactivate}
                    canManageAccess={canManageAccess && canManageAccessFor(actorRole, member.role)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
