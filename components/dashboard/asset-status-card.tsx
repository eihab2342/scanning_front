import Link from "next/link";
import { Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetStatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { DashboardOverviewView } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";

export function AssetStatusCard({ overview }: { overview: DashboardOverviewView }) {
  const { assets: assetUsage } = overview.usage;
  const recent = overview.assets.recent;

  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between px-4">
        <CardTitle className="text-sm font-medium">Assets</CardTitle>
        <Link href="/assets" className="text-xs font-medium text-primary hover:underline">
          View all assets
        </Link>
      </CardHeader>
      <CardContent className="px-4">
        <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{assetUsage.verified}</span> verified
          </span>
          <span>
            <span className="font-semibold text-foreground">{assetUsage.pending}</span> pending
          </span>
          <span>
            <span className="font-semibold text-foreground">{assetUsage.revoked}</span> revoked
          </span>
        </div>

        {recent.length === 0 ? (
          <EmptyState icon={Server} title="No assets yet" description="Add your first asset to start verifying ownership." compact />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recent.map((asset) => (
              <li key={asset.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="truncate text-foreground">{asset.value}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatRelative(asset.createdAt)}</span>
                  <AssetStatusBadge status={asset.ownershipStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
