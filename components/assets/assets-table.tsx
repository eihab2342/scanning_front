import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AssetStatusBadge } from "@/components/common/status-badge";
import { AssetRowActions } from "./asset-row-actions";
import { Asset } from "@/lib/api/types";
import { verificationMethodLabel } from "@/lib/asset-format";
import { formatRelative } from "@/lib/format";

/** Desktop layout — hidden below md, where AssetsListMobile takes over instead of forcing horizontal scroll. */
export function AssetsTable({ assets, canMutate }: { assets: Asset[]; canMutate: boolean }) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Last checked</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/assets/${asset.id}`} className="hover:underline">
                  {asset.hostname}
                </Link>
              </TableCell>
              <TableCell>
                <AssetStatusBadge status={asset.ownershipStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">{verificationMethodLabel(asset.verificationMethod)}</TableCell>
              <TableCell className="text-muted-foreground">{asset.lastCheckedAt ? formatRelative(asset.lastCheckedAt) : "Never"}</TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(asset.createdAt)}</TableCell>
              <TableCell>
                <AssetRowActions asset={asset} canMutate={canMutate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
