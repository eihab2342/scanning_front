"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AssetsSkeleton } from "./assets-skeleton";
import { AssetStatusSummary } from "./asset-status-summary";
import { AssetsTable } from "./assets-table";
import { AssetsListMobile } from "./assets-list-mobile";
import { AddAssetDialog } from "./add-asset-dialog";
import { useAssets } from "@/lib/api/use-assets";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { usePermissions } from "@/lib/auth/permissions-context";
import { OwnershipStatus } from "@/lib/api/types";

const STATUS_FILTERS: Array<{ value: OwnershipStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "revoked", label: "Revoked" },
];

export function AssetsPage() {
  const { can } = usePermissions();
  const assetsQuery = useAssets();
  const overviewQuery = useDashboardOverview();
  const [addOpen, setAddOpen] = useState(false);
  const [status, setStatus] = useState<OwnershipStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const assets = assetsQuery.data ?? [];
    return assets.filter((asset) => {
      const matchesStatus = status === "all" || asset.ownershipStatus === status;
      const matchesSearch = !search || asset.hostname.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [assetsQuery.data, status, search]);

  if (assetsQuery.isPending || overviewQuery.isPending) return <AssetsSkeleton />;

  if (assetsQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={assetsQuery.error} onRetry={() => assetsQuery.refetch()} />
      </div>
    );
  }

  const assets = assetsQuery.data ?? [];
  const overview = overviewQuery.data;
  const canCreate = can("assets.create");
  const canRevoke = can("assets.revoke");
  const canManageBilling = can("billing.view");

  const isRestricted = overview
    ? overview.organization.isSuspended || overview.subscription.status === "past_due" || overview.subscription.status === "cancelled"
    : false;

  const assetLimit = overview?.usage.assets.limit ?? null;
  const nonRevokedCount = assets.filter((a) => a.ownershipStatus !== "revoked").length;
  const atLimit = assetLimit !== null && nonRevokedCount >= assetLimit;
  const showAddButton = canCreate && !isRestricted;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Assets</h2>
          <p className="text-sm text-muted-foreground">
            Add the domains you want to scan, then verify ownership to unlock scanning.
            {assetLimit !== null ? ` ${nonRevokedCount} / ${assetLimit} used.` : ""}
          </p>
        </div>
        {showAddButton ? (
          <Button onClick={() => setAddOpen(true)} disabled={atLimit}>
            <Plus className="size-4" data-icon="inline-start" />
            Add Asset
          </Button>
        ) : null}
      </div>

      {atLimit && showAddButton ? (
        <div className="px-4 sm:px-6">
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Your current plan allows up to {assetLimit} assets.
            {canManageBilling ? (
              <>
                {" "}
                <Link href="/billing" className="font-medium text-foreground underline underline-offset-2">
                  Upgrade your plan
                </Link>{" "}
                to add more.
              </>
            ) : (
              " Ask an admin to upgrade your plan to add more."
            )}
          </div>
        </div>
      ) : null}

      <div className="px-4 sm:px-6">
        <AssetStatusSummary assets={assets} />
      </div>

      {assets.length === 0 ? (
        <div className="px-4 sm:px-6">
          <EmptyState
            icon={Server}
            title="No assets yet"
            description="Add a domain and verify ownership before you can run a scan against it."
            action={
              showAddButton ? (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="size-4" data-icon="inline-start" />
                  Add your first asset
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6">
            <Input placeholder="Search by hostname…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  variant={status === filter.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="px-4 sm:px-6">
            {filtered.length === 0 ? (
              <EmptyState icon={Server} title="No assets match your filters" compact />
            ) : (
              <>
                <AssetsTable assets={filtered} canMutate={canRevoke} />
                <AssetsListMobile assets={filtered} canMutate={canRevoke} />
              </>
            )}
          </div>
        </>
      )}

      <AddAssetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        atLimit={atLimit}
        limitDescription={assetLimit !== null ? `Your current plan allows up to ${assetLimit} assets.` : undefined}
      />
    </div>
  );
}
