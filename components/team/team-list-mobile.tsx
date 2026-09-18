import { Card, CardContent } from "@/components/ui/card";
import { MemberStatusBadge } from "@/components/common/status-badge";
import { TeamRoleControl } from "./team-role-control";
import { TeamRowActions } from "./team-row-actions";
import { TeamMember, Role } from "@/lib/api/types";
import { canManageAccessFor } from "@/lib/role";
import { formatDate } from "@/lib/format";

interface TeamListMobileProps {
  members: TeamMember[];
  actorRole: Role;
  currentUserId: string;
  canChangeRole: boolean;
  canDeactivate: boolean;
  canReactivate: boolean;
  canManageAccess: boolean;
}

/** Purpose-built mobile cards — each makes the member, role, and status clear without a cramped table. */
export function TeamListMobile({ members, actorRole, currentUserId, canChangeRole, canDeactivate, canReactivate, canManageAccess }: TeamListMobileProps) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {members.map((member) => {
        const isSelf = member.id === currentUserId;
        return (
          <Card key={member.id} size="sm">
            <CardContent className="flex items-start justify-between gap-2 px-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {member.email}
                  {isSelf ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span> : null}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <MemberStatusBadge isActive={member.isActive} />
                  <TeamRoleControl member={member} actorRole={actorRole} canChangeRole={canChangeRole} isSelf={isSelf} />
                </div>
                <span className="text-xs text-muted-foreground">Joined {formatDate(member.createdAt)}</span>
              </div>
              <TeamRowActions
                member={member}
                isSelf={isSelf}
                canDeactivate={canDeactivate}
                canReactivate={canReactivate}
                canManageAccess={canManageAccess && canManageAccessFor(actorRole, member.role)}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
