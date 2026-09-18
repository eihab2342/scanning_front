import Link from "next/link";
import { Plus, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardOverviewView } from "@/lib/api/types";
import { usePermissions } from "@/lib/auth/permissions-context";

export function OverviewHeader({ overview }: { overview: DashboardOverviewView }) {
  const { can } = usePermissions();
  const hasVerifiedAssets = overview.usage.assets.verified > 0;
  const canAct = hasVerifiedAssets ? can("scans.create") : can("assets.create");

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">{overview.organization.name} — what needs your attention right now.</p>
      </div>
      {canAct ? (
        <Button nativeButton={false} render={<Link href={hasVerifiedAssets ? "/scans" : "/assets"} />}>
          {hasVerifiedAssets ? <ScanSearch className="size-4" data-icon="inline-start" /> : <Plus className="size-4" data-icon="inline-start" />}
          {hasVerifiedAssets ? "Run Scan" : "Add Asset"}
        </Button>
      ) : null}
    </div>
  );
}
