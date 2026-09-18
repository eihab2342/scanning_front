"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Info, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AdminOrganizationDetail, BillingInterval, SubscriptionStatus } from "@/lib/admin/api/types";
import { useAdminPlans } from "@/lib/admin/api/use-plans";
import { useUpdateOrganizationSubscription } from "@/lib/admin/api/use-organizations";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/common/empty-state";

const STATUS_OPTIONS: SubscriptionStatus[] = ["trialing", "active", "past_due", "cancelled"];
const INTERVAL_OPTIONS: BillingInterval[] = ["monthly", "yearly"];

export function AdminOrgSubscriptionTab({ organization }: { organization: AdminOrganizationDetail }) {
  const { admin } = useAdminAuth();
  const plansQuery = useAdminPlans();
  const updateSubscription = useUpdateOrganizationSubscription(organization.id);
  const subscription = organization.subscription;

  const canWrite = canPerform(admin?.role, "organization.update_subscription");
  const isStripeManaged = Boolean(subscription?.stripeSubscriptionId);

  const [planId, setPlanId] = useState(subscription?.planId ?? "");
  const [status, setStatus] = useState<SubscriptionStatus>(subscription?.status ?? "active");
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(subscription?.billingInterval ?? "monthly");
  const [scanQuota, setScanQuota] = useState(String(subscription?.scanQuota ?? ""));
  const [scansUsed, setScansUsed] = useState(String(subscription?.scansUsed ?? ""));

  if (!subscription) {
    return (
      <EmptyState icon={Receipt} title="No subscription on file" description="This organization has no subscription record." compact />
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: Record<string, unknown> = {
      scanQuota: scanQuota === "" ? undefined : Number(scanQuota),
      scansUsed: scansUsed === "" ? undefined : Number(scansUsed),
    };
    if (!isStripeManaged) {
      dto.planId = planId || undefined;
      dto.status = status;
      dto.billingInterval = billingInterval;
    }
    try {
      await updateSubscription.mutateAsync(dto);
      toast.success("Subscription updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update subscription.");
    }
  }

  const submitError = updateSubscription.error instanceof ApiError ? updateSubscription.error.message : null;

  return (
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Billing period</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Current period</p>
            <p className="text-sm text-foreground">
              {formatDateTime(subscription.currentPeriodStart)} — {formatDateTime(subscription.currentPeriodEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Usage period</p>
            <p className="text-sm text-foreground">
              {formatDateTime(subscription.usagePeriodStart)} — {formatDateTime(subscription.usagePeriodEnd)}
            </p>
          </div>
          {subscription.trialEndsAt ? (
            <div>
              <p className="text-xs text-muted-foreground">Trial ends</p>
              <p className="text-sm text-foreground">{formatDateTime(subscription.trialEndsAt)}</p>
            </div>
          ) : null}
          {subscription.cancelAtPeriodEnd ? (
            <div>
              <p className="text-xs text-muted-foreground">Cancellation</p>
              <p className="text-sm text-foreground">Cancels at period end</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs text-muted-foreground">Stripe</p>
            <p className="text-sm text-foreground">{isStripeManaged ? subscription.stripeSubscriptionId : "Not Stripe-backed"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm font-medium">Administer subscription</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {isStripeManaged ? (
            <Alert className="mb-4">
              <Info />
              <AlertDescription>
                This subscription is Stripe-managed — plan, status, and billing interval must change through Stripe (Customer Portal or the
                tenant billing endpoints). scanQuota/scansUsed comps are still adjustable below.
              </AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isStripeManaged ? (
              <>
                <Field>
                  <FieldLabel>Plan</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {(plansQuery.data ?? []).map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        disabled={!canWrite}
                        onClick={() => setPlanId(plan.id)}
                        aria-pressed={planId === plan.id}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-sm transition-colors",
                          planId === plan.id ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                          !canWrite && "opacity-50",
                        )}
                      >
                        {plan.name}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={!canWrite}
                        onClick={() => setStatus(option)}
                        aria-pressed={status === option}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-sm capitalize transition-colors",
                          status === option ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                          !canWrite && "opacity-50",
                        )}
                      >
                        {option.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Billing interval</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERVAL_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={!canWrite}
                        onClick={() => setBillingInterval(option)}
                        aria-pressed={billingInterval === option}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-sm capitalize transition-colors",
                          billingInterval === option ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                          !canWrite && "opacity-50",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="scan-quota">Scan quota (comp)</FieldLabel>
                <Input id="scan-quota" type="number" min={0} value={scanQuota} disabled={!canWrite} onChange={(e) => setScanQuota(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="scans-used">Scans used (correction)</FieldLabel>
                <Input id="scans-used" type="number" min={0} value={scansUsed} disabled={!canWrite} onChange={(e) => setScansUsed(e.target.value)} />
                <FieldDescription>Independent of the plan default — a one-off comp/correction.</FieldDescription>
              </Field>
            </div>

            {submitError ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            {canWrite ? (
              <div>
                <Button type="submit" disabled={updateSubscription.isPending}>
                  {updateSubscription.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Your role doesn&apos;t permit editing subscriptions.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
