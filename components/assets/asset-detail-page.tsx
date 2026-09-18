"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ScanSearch, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetStatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationPanel } from "./verification-panel";
import { useAsset, useRevokeAsset } from "@/lib/api/use-assets";
import { usePermissions } from "@/lib/auth/permissions-context";
import { verificationMethodLabel } from "@/lib/asset-format";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

export function AssetDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="asset-detail-skeleton">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

export function AssetDetailPage({ id }: { id: string }) {
  const { can } = usePermissions();
  const assetQuery = useAsset(id);
  const revoke = useRevokeAsset(id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (assetQuery.isPending) return <AssetDetailSkeleton />;

  if (assetQuery.isError) {
    const notFound = assetQuery.error instanceof ApiError && assetQuery.error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState
          error={notFound ? new ApiError(404, "This asset doesn't exist, or you don't have access to it.") : assetQuery.error}
          onRetry={notFound ? undefined : () => assetQuery.refetch()}
        />
      </div>
    );
  }

  const asset = assetQuery.data;
  const canRevoke = can("assets.revoke");

  async function handleRevoke() {
    try {
      await revoke.mutateAsync();
      toast.success(`${asset.hostname} ownership was revoked`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not revoke this asset.");
      throw error;
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <Link href="/assets" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to assets
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{asset.hostname}</h2>
          <div className="mt-1 flex items-center gap-2">
            <AssetStatusBadge status={asset.ownershipStatus} />
            <span className="text-sm text-muted-foreground">{verificationMethodLabel(asset.verificationMethod)}</span>
          </div>
        </div>
        {canRevoke && asset.ownershipStatus !== "revoked" ? (
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <ShieldOff className="size-4" data-icon="inline-start" />
            Revoke ownership
          </Button>
        ) : null}
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Created</p>
            <p className="text-sm text-foreground">{formatDateTime(asset.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Verified</p>
            <p className="text-sm text-foreground">{asset.verifiedAt ? formatDateTime(asset.verifiedAt) : "Not yet verified"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Last checked</p>
            <p className="text-sm text-foreground">{asset.lastCheckedAt ? formatDateTime(asset.lastCheckedAt) : "Never"}</p>
          </div>
        </CardContent>
      </Card>

      {asset.ownershipStatus === "revoked" ? (
        <Card className="py-4">
          <CardContent className="flex flex-col gap-2 px-4">
            <p className="text-sm font-medium text-foreground">Ownership revoked</p>
            <p className="text-sm text-muted-foreground">
              This asset&apos;s ownership has been revoked and cannot be re-verified. Scans are unavailable for it — add a new asset if you need
              to scan this domain again.
            </p>
          </CardContent>
        </Card>
      ) : asset.ownershipStatus === "pending" ? (
        <VerificationPanel asset={asset} canVerify={can("assets.verify")} />
      ) : (
        <Card className="py-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
            <p className="text-sm text-muted-foreground">Ownership verified — this asset is ready to scan.</p>
            <Button nativeButton={false} render={<Link href={`/scans?assetId=${asset.id}&action=create`} />}>
              <ScanSearch className="size-4" data-icon="inline-start" />
              Run First Scan
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Revoke asset ownership?"
        description={`${asset.hostname} will be marked as unverified. This cannot be undone, and scans will be unavailable for this asset until a new one is added and verified.`}
        confirmLabel="Revoke"
        destructive
        onConfirm={handleRevoke}
      />
    </div>
  );
}
