import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionStatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { AdminOrganizationListItem } from "@/lib/admin/api/types";
import { formatDate } from "@/lib/format";

export function AdminOrganizationsListMobile({ organizations }: { organizations: AdminOrganizationListItem[] }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {organizations.map((org) => (
        <Card key={org.id} size="sm">
          <CardContent className="px-4">
            <Link href={`/admin/organizations/${org.id}`} className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{org.name}</span>
                {org.suspendedAt ? <Badge variant="destructive">Suspended</Badge> : null}
              </div>
              <span className="truncate text-xs text-muted-foreground">{org.slug}</span>
              <div className="flex flex-wrap items-center gap-2">
                {org.subscription ? <SubscriptionStatusBadge status={org.subscription.status} /> : null}
                <span className="text-xs text-muted-foreground">{org.subscription?.plan.name ?? "No plan"}</span>
              </div>
              {org.subscription ? (
                <span className="text-xs text-muted-foreground">
                  {org.subscription.scansUsed} / {org.subscription.scanQuota} scans used
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">Created {formatDate(org.createdAt)}</span>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
