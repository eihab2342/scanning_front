import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AdminAuditLogEntry } from "@/lib/admin/api/types";
import { formatAdminAction } from "@/lib/admin/audit-format";
import { formatRelative } from "@/lib/format";

export function AuditLogListMobile({ entries, showOrganization = true }: { entries: AdminAuditLogEntry[]; showOrganization?: boolean }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {entries.map((entry) => (
        <Card key={entry.id} size="sm">
          <CardContent className="flex flex-col gap-1 px-4">
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{formatAdminAction(entry.action)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{entry.platformAdmin?.email ?? "system"}</span>
            {showOrganization && entry.organization ? (
              <Link href={`/admin/organizations/${entry.organization.id}`} className="text-xs text-muted-foreground hover:underline">
                {entry.organization.name}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
