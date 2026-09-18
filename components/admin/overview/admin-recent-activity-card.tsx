import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { AdminAuditLogEntry } from "@/lib/admin/api/types";
import { formatAdminAction } from "@/lib/admin/audit-format";
import { formatRelative } from "@/lib/format";

export function AdminRecentActivityCard({ items }: { items: AdminAuditLogEntry[] }) {
  return (
    <Card className="py-4">
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="text-sm font-medium">Recent platform activity</CardTitle>
        <Link href="/admin/audit" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-4">
        {items.length === 0 ? (
          <EmptyState icon={ScrollText} title="No platform activity yet" compact />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-foreground">{formatAdminAction(item.action)}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.platformAdmin?.email ?? "system"}
                    {item.organization ? ` · ${item.organization.name}` : ""}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
