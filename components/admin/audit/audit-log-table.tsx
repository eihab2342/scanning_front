import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminAuditLogEntry } from "@/lib/admin/api/types";
import { formatAdminAction } from "@/lib/admin/audit-format";
import { formatDateTime } from "@/lib/format";

export function AuditLogTable({ entries, showOrganization = true }: { entries: AdminAuditLogEntry[]; showOrganization?: boolean }) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            {showOrganization ? <TableHead>Organization</TableHead> : null}
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium text-foreground">{formatAdminAction(entry.action)}</TableCell>
              <TableCell className="text-muted-foreground">{entry.platformAdmin?.email ?? "system"}</TableCell>
              {showOrganization ? (
                <TableCell className="text-muted-foreground">
                  {entry.organization ? (
                    <Link href={`/admin/organizations/${entry.organization.id}`} className="hover:underline">
                      {entry.organization.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
              ) : null}
              <TableCell className="text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
