"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, ScanSearch } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { useAssets } from "@/lib/api/use-assets";
import { useCreateScan } from "@/lib/api/use-scans";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { ApiError } from "@/lib/api/client";

interface RunScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedAssetId?: string;
}

export function RunScanDialog({ open, onOpenChange, preselectedAssetId }: RunScanDialogProps) {
  const router = useRouter();
  const assetsQuery = useAssets();
  const overviewQuery = useDashboardOverview();
  const createScan = useCreateScan();
  const [assetId, setAssetId] = useState<string | undefined>(preselectedAssetId);

  // Reset the dialog's local state when it transitions to open — adjusted
  // during render (React's recommended pattern for "reset on prop change")
  // rather than in an effect, which would set state on a delayed extra pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAssetId(preselectedAssetId);
      createScan.reset();
    }
  }

  const verifiedAssets = (assetsQuery.data ?? []).filter((a) => a.ownershipStatus === "verified");
  const overview = overviewQuery.data;
  const remaining = overview?.usage.scans.remaining ?? null;
  const quotaExhausted = remaining !== null && remaining <= 0;

  async function handleSubmit() {
    if (!assetId) return;
    try {
      const scan = await createScan.mutateAsync({ assetId });
      toast.success("Scan started.");
      onOpenChange(false);
      router.push(`/scans/${scan.id}`);
    } catch {
      // Surfaced below via createScan.error — including the race where the
      // backend rejects for quota-exhausted even though the frontend
      // thought there was capacity.
    }
  }

  const submitError = createScan.error instanceof ApiError ? createScan.error.message : null;
  const isLoading = assetsQuery.isPending || overviewQuery.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run scan</DialogTitle>
          <DialogDescription>Choose a verified asset to scan.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : verifiedAssets.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No verified assets"
            description="A verified asset is required before running a scan."
            action={
              <Button nativeButton={false} render={<Link href="/assets" />}>
                Go to Assets
              </Button>
            }
            compact
          />
        ) : quotaExhausted ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>
              You have used all scans available for this usage period ({overview!.usage.scans.used} / {overview!.usage.scans.limit}).
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Asset</span>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {verifiedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setAssetId(asset.id)}
                    aria-pressed={assetId === asset.id}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
                      assetId === asset.id ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                    )}
                  >
                    {asset.hostname}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {remaining} scan{remaining === 1 ? "" : "s"} remaining this period ({overview!.usage.scans.used} / {overview!.usage.scans.limit} used).
            </p>

            {submitError ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createScan.isPending}>
            Cancel
          </Button>
          {!isLoading && verifiedAssets.length > 0 && !quotaExhausted ? (
            <Button type="button" onClick={handleSubmit} disabled={!assetId || createScan.isPending}>
              {createScan.isPending ? "Starting…" : "Run scan"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
