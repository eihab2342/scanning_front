import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SubscriptionStatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { AdminOrganizationListItem } from "@/lib/admin/api/types";
import { formatDate } from "@/lib/format";

export function AdminOrganizationsTable({ organizations }: { organizations: AdminOrganizationListItem[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Organization</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Suspension</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/organizations/${org.id}`} className="hover:underline">
                  {org.name}
                </Link>
                <p className="text-xs font-normal text-muted-foreground">{org.slug}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{org.subscription?.plan.name ?? "—"}</TableCell>
              <TableCell>{org.subscription ? <SubscriptionStatusBadge status={org.subscription.status} /> : "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {org.subscription ? `${org.subscription.scansUsed} / ${org.subscription.scanQuota} scans` : "—"}
              </TableCell>
              <TableCell>
                {org.suspendedAt ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="outline">Active</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(org.createdAt)}</TableCell>
              <TableCell>
                <Link href={`/admin/organizations/${org.id}`} className="text-xs font-medium text-primary hover:underline">
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
