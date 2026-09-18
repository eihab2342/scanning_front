"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TeamSkeleton } from "./team-skeleton";
import { TeamTable } from "./team-table";
import { TeamListMobile } from "./team-list-mobile";
import { InviteMemberDialog } from "./invite-member-dialog";
import { useTeam } from "@/lib/api/use-team";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { useAuth } from "@/lib/auth/auth-context";
import { usePermissions } from "@/lib/auth/permissions-context";

export function TeamPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const teamQuery = useTeam();
  const overviewQuery = useDashboardOverview();
  const [inviteOpen, setInviteOpen] = useState(false);

  if (teamQuery.isPending || overviewQuery.isPending) return <TeamSkeleton />;

  if (teamQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={teamQuery.error} onRetry={() => teamQuery.refetch()} />
      </div>
    );
  }

  const members = teamQuery.data ?? [];
  const overview = overviewQuery.data;
  const canInvite = can("team.invite");
  const canChangeRole = can("team.change_role");
  const canDeactivate = can("team.deactivate");
  const canReactivate = can("team.reactivate");
  const canManageAccess = can("team.manage_access");
  const canManageBilling = can("billing.view");

  const teamLimit = overview?.usage.teamMembers.limit ?? null;
  const activeCount = members.filter((m) => m.isActive).length;
  const atLimit = teamLimit !== null && activeCount >= teamLimit;
  const showInviteButton = canInvite;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Team</h2>
          <p className="text-sm text-muted-foreground">
            {teamLimit !== null ? `${activeCount} / ${teamLimit} seats used.` : `${activeCount} member${activeCount === 1 ? "" : "s"} — unlimited seats.`}
          </p>
        </div>
        {showInviteButton ? (
          <Button onClick={() => setInviteOpen(true)} disabled={atLimit}>
            <Plus className="size-4" data-icon="inline-start" />
            Invite Member
          </Button>
        ) : null}
      </div>

      {atLimit && showInviteButton ? (
        <div className="px-4 sm:px-6">
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Your current plan allows up to {teamLimit} team members.
            {canManageBilling ? (
              <>
                {" "}
                <Link href="/billing" className="font-medium text-foreground underline underline-offset-2">
                  Upgrade your plan
                </Link>{" "}
                to add more.
              </>
            ) : (
              " Ask an admin to upgrade your plan to add more."
            )}
          </div>
        </div>
      ) : null}

      <div className="px-4 sm:px-6">
        {members.length === 0 ? (
          <EmptyState icon={Users} title="No team members yet" description="Invite your first team member to get started." />
        ) : (
          <>
            <TeamTable
              members={members}
              actorRole={user!.role}
              currentUserId={user!.userId}
              canChangeRole={canChangeRole}
              canDeactivate={canDeactivate}
              canReactivate={canReactivate}
              canManageAccess={canManageAccess}
            />
            <TeamListMobile
              members={members}
              actorRole={user!.role}
              currentUserId={user!.userId}
              canChangeRole={canChangeRole}
              canDeactivate={canDeactivate}
              canReactivate={canReactivate}
              canManageAccess={canManageAccess}
            />
          </>
        )}
      </div>

      {showInviteButton ? (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          actorRole={user!.role}
          atLimit={atLimit}
          limitDescription={teamLimit !== null ? `Your current plan allows up to ${teamLimit} team members.` : undefined}
        />
      ) : null}
    </div>
  );
}
