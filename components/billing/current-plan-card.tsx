import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionStatusBadge } from "@/components/common/status-badge";
import { CreditCard, ExternalLink } from "lucide-react";
import { DashboardOverviewView, SubscriptionView } from "@/lib/api/types";
import { formatDate, formatMoneyCents } from "@/lib/format";

function LimitLine({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{limit === null ? `${used} (unlimited)` : `${used} / ${limit}`}</span>
    </div>
  );
}

export function CurrentPlanCard({
  subscription,
  usage,
  canPortal,
  onPortal,
  portalPending,
  canCancel,
  onCancel,
  canReactivate,
  onReactivate,
  reactivatePending,
}: {
  subscription: SubscriptionView;
  usage?: DashboardOverviewView["usage"];
  canPortal: boolean;
  onPortal: () => void;
  portalPending: boolean;
  canCancel: boolean;
  onCancel: () => void;
  canReactivate: boolean;
  onReactivate: () => void;
  reactivatePending: boolean;
}) {
  const { plan } = subscription;
  const priceCents = subscription.billingInterval === "yearly" ? plan.yearlyPriceCents : plan.monthlyPriceCents;

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {plan.name}
            <SubscriptionStatusBadge status={subscription.status} />
          </CardTitle>
          {canPortal ? (
            <Button variant="outline" size="sm" onClick={onPortal} disabled={portalPending}>
              <CreditCard className="size-3.5" data-icon="inline-start" />
              {portalPending ? "Opening…" : "Manage Billing"}
              <ExternalLink className="size-3" data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Price</p>
            <p className="text-sm text-foreground">
              {priceCents === 0 ? "Free" : `${formatMoneyCents(priceCents, plan.currency)} / ${subscription.billingInterval}`}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current billing period</p>
            <p className="text-sm text-foreground">
              {formatDate(subscription.currentPeriodStart)} → {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
          {subscription.status === "trialing" && subscription.trialEndsAt ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Trial ends</p>
              <p className="text-sm text-foreground">{formatDate(subscription.trialEndsAt)}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Renewal</p>
            <p className="text-sm text-foreground">
              {subscription.status === "cancelled"
                ? "Ended"
                : subscription.cancelAtPeriodEnd
                  ? `Ends ${formatDate(subscription.currentPeriodEnd)}`
                  : `Renews ${formatDate(subscription.currentPeriodEnd)}`}
            </p>
          </div>
        </div>

        {usage ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Effective limits</p>
            <LimitLine label="Scans this period" used={usage.scans.used} limit={usage.scans.limit} />
            <LimitLine label="Assets" used={usage.assets.total} limit={usage.assets.limit} />
            <LimitLine label="Team members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} />
          </div>
        ) : null}

        {plan.features.length > 0 ? (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Included features</p>
            <ul className="flex flex-col gap-1 text-sm text-foreground">
              {plan.features.map((feature) => (
                <li key={feature.key}>{feature.name}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(canCancel || canReactivate) && subscription.status !== "cancelled" ? (
          <div className="flex gap-2 border-t border-border pt-3">
            {canCancel && !subscription.cancelAtPeriodEnd ? (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel subscription
              </Button>
            ) : null}
            {canReactivate && subscription.cancelAtPeriodEnd ? (
              <Button variant="outline" size="sm" onClick={onReactivate} disabled={reactivatePending}>
                {reactivatePending ? "Reactivating…" : "Reactivate subscription"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
