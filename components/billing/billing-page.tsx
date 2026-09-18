"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Clock } from "lucide-react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentPlanCard } from "./current-plan-card";
import { PlanCard } from "./plan-card";
import { ChangePlanDialog } from "./change-plan-dialog";
import { KashierReturnBanner } from "./kashier-return-banner";
import {
  useSubscription,
  usePlans,
  useCreatePortalSession,
  useChangePlan,
  useCancelSubscription,
  useReactivateSubscription,
} from "@/lib/api/use-billing";
import { useCashPayments } from "@/lib/api/use-cash-payments";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { usePermissions } from "@/lib/auth/permissions-context";
import { ApiError } from "@/lib/api/client";
import { redirectTo } from "@/lib/browser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BillingInterval, PublicPlanView } from "@/lib/api/types";

function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6" data-testid="billing-skeleton">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

export function BillingPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const subscriptionQuery = useSubscription();
  const plansQuery = usePlans();
  const overviewQuery = useDashboardOverview();
  const cashPaymentsQuery = useCashPayments();

  // Derived, not synced-via-effect: defaults to the subscription's own
  // billing interval until the user explicitly picks one on this page.
  const [intervalOverride, setIntervalOverride] = useState<BillingInterval | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PublicPlanView | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const portal = useCreatePortalSession();
  const changePlan = useChangePlan();
  const cancel = useCancelSubscription();
  const reactivate = useReactivateSubscription();

  if (subscriptionQuery.isPending || plansQuery.isPending) return <BillingSkeleton />;

  if (subscriptionQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={subscriptionQuery.error} onRetry={() => subscriptionQuery.refetch()} />
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={plansQuery.error} onRetry={() => plansQuery.refetch()} />
      </div>
    );
  }

  const subscription = subscriptionQuery.data;
  const plans = plansQuery.data ?? [];
  const usage = overviewQuery.data?.usage;
  const interval = intervalOverride ?? subscription.billingInterval;
  const hasYearlyPlan = plans.some((p) => p.billingYearlyEnabled);

  const canCheckout = can("billing.checkout");
  const canChangePlan = can("billing.change_plan");
  const canPortal = can("billing.portal");
  const canCancel = can("billing.cancel");
  const canReactivate = can("billing.reactivate");

  function handleError(error: unknown, fallback: string) {
    toast.error(error instanceof ApiError ? error.message : fallback);
  }

  function handleChoosePlan(plan: PublicPlanView) {
    if (plan.id === subscription.plan.id) return;

    if (subscription.hasBillingAccount) {
      setPendingPlan(plan);
      return;
    }

    // No billing account yet — first purchase goes to a real order-review +
    // payment page (see CheckoutPage), not an in-app dialog. A Stripe-backed
    // subscription always goes through change-plan above instead.
    router.push(`/billing/checkout?planId=${plan.id}&interval=${interval}`);
  }

  async function confirmChangePlan() {
    if (!pendingPlan) return;
    try {
      await changePlan.mutateAsync({ planId: pendingPlan.id, billingInterval: interval });
      toast.success("Plan change requested — this can take a few seconds to apply.");
      setPendingPlan(null);
    } catch (error) {
      handleError(error, "Could not change your plan.");
    }
  }

  async function handlePortal() {
    try {
      const { url } = await portal.mutateAsync();
      redirectTo(url);
    } catch (error) {
      handleError(error, "Could not open the billing portal.");
    }
  }

  async function handleCancel() {
    try {
      await cancel.mutateAsync();
      toast.success(`Your subscription will remain active until the end of the current period.`);
    } catch (error) {
      handleError(error, "Could not cancel this subscription.");
      throw error;
    }
  }

  async function handleReactivate() {
    try {
      await reactivate.mutateAsync();
      toast.success("Your subscription will continue.");
    } catch (error) {
      handleError(error, "Could not reactivate this subscription.");
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Billing</h2>
        <p className="text-sm text-muted-foreground">Your plan, subscription status, and available upgrades.</p>
      </div>

      <KashierReturnBanner />

      <CurrentPlanCard
        subscription={subscription}
        usage={usage}
        canPortal={canPortal}
        onPortal={handlePortal}
        portalPending={portal.isPending}
        canCancel={canCancel}
        onCancel={() => setCancelOpen(true)}
        canReactivate={canReactivate}
        onReactivate={handleReactivate}
        reactivatePending={reactivate.isPending}
      />

      {(cashPaymentsQuery.data ?? []).some((r) => r.status === "pending") ? (
        <Alert>
          <Clock />
          <AlertDescription>
            A cash payment request for {(cashPaymentsQuery.data ?? []).find((r) => r.status === "pending")!.plan.name} is pending admin review — your plan
            will update once it&apos;s approved.
          </AlertDescription>
        </Alert>
      ) : null}

      {plans.length === 0 ? (
        <EmptyState icon={CreditCard} title="No plans are available right now" compact />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Available plans</h3>
            {hasYearlyPlan ? (
              <div className="inline-flex rounded-lg border border-border p-0.5">
                <Button type="button" size="sm" variant={interval === "monthly" ? "secondary" : "ghost"} onClick={() => setIntervalOverride("monthly")}>
                  Monthly
                </Button>
                <Button type="button" size="sm" variant={interval === "yearly" ? "secondary" : "ghost"} onClick={() => setIntervalOverride("yearly")}>
                  Yearly
                </Button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === subscription.plan.id;
              const requiredPermission = subscription.hasBillingAccount ? canChangePlan : canCheckout;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  interval={interval}
                  isCurrent={isCurrent}
                  canChoose={requiredPermission}
                  pending={changePlan.isPending}
                  onChoose={() => handleChoosePlan(plan)}
                />
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription?"
        description={`Your subscription will remain active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}, then it will end. You can reactivate any time before then.`}
        confirmLabel="Cancel subscription"
        destructive
        onConfirm={handleCancel}
      />

      <ChangePlanDialog
        plan={pendingPlan}
        interval={interval}
        isSubmitting={changePlan.isPending}
        onOpenChange={(open) => !open && setPendingPlan(null)}
        onConfirm={confirmChangePlan}
      />
    </div>
  );
}
