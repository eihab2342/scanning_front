"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, Eye, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useRevokeAsset } from "@/lib/api/use-assets";
import { Asset } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

export function AssetRowActions({ asset, canMutate }: { asset: Asset; canMutate: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const revoke = useRevokeAsset(asset.id);

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Asset actions" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/assets/${asset.id}`} />}>
            <Eye className="size-4" data-icon="inline-start" />
            View details
          </DropdownMenuItem>
          {canMutate && asset.ownershipStatus !== "revoked" ? (
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <ShieldOff className="size-4" data-icon="inline-start" />
              Revoke ownership
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Revoke asset ownership?"
        description={`${asset.hostname} will be marked as unverified. This cannot be undone, and scans will be unavailable for this asset until a new one is added and verified.`}
        confirmLabel="Revoke"
        destructive
        onConfirm={handleRevoke}
      />
    </>
  );
}
