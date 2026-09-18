import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionStatusBadge } from "@/components/common/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminOrganizationDetail } from "@/lib/admin/api/types";
import { formatDate, formatDateTime } from "@/lib/format";

export function AdminOrgOverviewTab({ organization }: { organization: AdminOrganizationDetail }) {
  const { subscription } = organization;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <p className="text-xs font-medium text-muted-foreground">Plan</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{subscription?.plan.name ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="mt-1.5">{subscription ? <SubscriptionStatusBadge status={subscription.status} /> : "—"}</div>
          </CardContent>
        </Card>
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <p className="text-xs font-medium text-muted-foreground">Assets</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{organization._count.assets}</p>
          </CardContent>
        </Card>
        <Card className="gap-1 py-4">
          <CardContent className="px-4">
            <p className="text-xs font-medium text-muted-foreground">Scans</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{organization._count.scans}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Organization</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm text-foreground">{formatDateTime(organization.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slug</p>
            <p className="text-sm text-foreground">{organization.slug}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Members ({organization.users.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organization.users.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium text-foreground">{member.email}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{member.role}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
