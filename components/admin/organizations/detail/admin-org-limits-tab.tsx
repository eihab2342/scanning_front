"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminOrganizationEffectiveLimits,
  useAdminOrganizationOverrides,
  useRemoveSubscriptionOverride,
} from "@/lib/admin/api/use-organizations";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { AdminOrganizationDetail, SubscriptionOverrideKey } from "@/lib/admin/api/types";
import { ApiError } from "@/lib/admin/api/client";
import { formatDate } from "@/lib/format";
import { OverrideDialog } from "./override-dialog";

const OVERRIDE_KEYS: SubscriptionOverrideKey[] = ["scan_quota", "asset_limit", "team_member_limit"];
const KEY_LABELS: Record<SubscriptionOverrideKey, string> = {
  scan_quota: "Scan quota",
  asset_limit: "Asset limit",
  team_member_limit: "Team member limit",
};

function planDefaultFor(organization: AdminOrganizationDetail, key: SubscriptionOverrideKey): number | null {
  const plan = organization.subscription?.plan;
  if (!plan) return null;
  if (key === "scan_quota") return plan.scanQuota;
  if (key === "asset_limit") return plan.assetLimit;
  return plan.teamMemberLimit;
}

export function AdminOrgLimitsTab({ organization }: { organization: AdminOrganizationDetail }) {
  const { admin } = useAdminAuth();
  const effectiveQuery = useAdminOrganizationEffectiveLimits(organization.id);
  const overridesQuery = useAdminOrganizationOverrides(organization.id);
  const removeOverride = useRemoveSubscriptionOverride(organization.id);
  const [editingKey, setEditingKey] = useState<SubscriptionOverrideKey | null>(null);

  const canWrite = canPerform(admin?.role, "subscription.override_write");

  if (overridesQuery.isError) {
    return <ErrorState error={overridesQuery.error} onRetry={() => overridesQuery.refetch()} />;
  }

  const overrides = overridesQuery.data ?? [];
  const overrideByKey = new Map(overrides.map((o) => [o.key, o]));

  async function handleRemove(key: SubscriptionOverrideKey) {
    try {
      await removeOverride.mutateAsync(key);
      toast.success(`${KEY_LABELS[key]} override removed.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove override.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Effective limits</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {effectiveQuery.isPending ? (
            <Skeleton className="h-16 rounded-lg" />
          ) : effectiveQuery.isError ? (
            <ErrorState error={effectiveQuery.error} onRetry={() => effectiveQuery.refetch()} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Scans</p>
                <p className="text-sm font-medium text-foreground">
                  {effectiveQuery.data.limits.scans.used} / {effectiveQuery.data.limits.scans.limit} used, {effectiveQuery.data.limits.scans.remaining}{" "}
                  remaining
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assets</p>
                <p className="text-sm font-medium text-foreground">{effectiveQuery.data.limits.assets.limit ?? "Unlimited"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Team members</p>
                <p className="text-sm font-medium text-foreground">{effectiveQuery.data.limits.teamMembers.limit ?? "Unlimited"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Subscription overrides</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Limit</TableHead>
                  <TableHead>Plan default</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {OVERRIDE_KEYS.map((key) => {
                  const existing = overrideByKey.get(key);
                  const planDefault = planDefaultFor(organization, key);
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium text-foreground">{KEY_LABELS[key]}</TableCell>
                      <TableCell className="text-muted-foreground">{planDefault ?? "Unlimited"}</TableCell>
                      <TableCell className="text-muted-foreground">{existing ? existing.value : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{existing?.expiresAt ? formatDate(existing.expiresAt) : existing ? "Never" : "—"}</TableCell>
                      <TableCell>
                        {canWrite ? (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${KEY_LABELS[key]} override`} onClick={() => setEditingKey(key)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            {existing ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remove ${KEY_LABELS[key]} override`}
                                onClick={() => handleRemove(key)}
                                disabled={removeOverride.isPending}
                              >
                                <Trash2 className="size-3.5 text-destructive" />
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingKey ? (
        <OverrideDialog
          organizationId={organization.id}
          overrideKey={editingKey}
          existing={overrideByKey.get(editingKey)}
          open={Boolean(editingKey)}
          onOpenChange={(open) => !open && setEditingKey(null)}
        />
      ) : null}
    </div>
  );
}
