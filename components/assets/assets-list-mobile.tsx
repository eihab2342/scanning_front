import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AssetStatusBadge } from "@/components/common/status-badge";
import { AssetRowActions } from "./asset-row-actions";
import { Asset } from "@/lib/api/types";
import { verificationMethodLabel } from "@/lib/asset-format";
import { formatRelative } from "@/lib/format";

/** Purpose-built mobile rows — each makes the asset, status, method, and the important action clear without a cramped table. */
export function AssetsListMobile({ assets, canMutate }: { assets: Asset[]; canMutate: boolean }) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {assets.map((asset) => (
        <Card key={asset.id} size="sm">
          <CardContent className="flex items-start justify-between gap-2 px-4">
            <Link href={`/assets/${asset.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{asset.hostname}</span>
              <div className="flex flex-wrap items-center gap-2">
                <AssetStatusBadge status={asset.ownershipStatus} />
                <span className="text-xs text-muted-foreground">{verificationMethodLabel(asset.verificationMethod)}</span>
              </div>
              <span className="text-xs text-muted-foreground">Added {formatRelative(asset.createdAt)}</span>
            </Link>
            <AssetRowActions asset={asset} canMutate={canMutate} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
