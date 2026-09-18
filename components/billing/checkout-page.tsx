"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Banknote, Check, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { useSubscription, usePlans } from "@/lib/api/use-billing";
import { useCreateKashierCheckout } from "@/lib/api/use-kashier-checkout";
import { useCreateCashPayment } from "@/lib/api/use-cash-payments";
import { ApiError } from "@/lib/api/client";
import { redirectTo } from "@/lib/browser";
import { formatMoneyCents } from "@/lib/format";
import { BillingInterval, PublicPlanView } from "@/lib/api/types";

function planFeatureLines(plan: PublicPlanView): string[] {
  const lines = [
    `${plan.scanQuota} scans / period`,
    plan.assetLimit === null ? "Unlimited assets" : `${plan.assetLimit} assets`,
    plan.teamMemberLimit === null ? "Unlimited team members" : `${plan.teamMemberLimit} team members`,
  ];
  for (const feature of plan.features) {
    lines.push(feature.type === "BOOLEAN" ? feature.name : `${feature.name}: ${feature.value}${feature.unit ? ` ${feature.unit}` : ""}`);
  }
  return lines;
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

/**
 * A real order-review + payment step, not a modal picker — plan/price/what's
 * included on the left, the actual payment action on the right, same shape
 * as a standard hosted-checkout preamble page. Reached from BillingPage's
 * "Choose plan" for a first purchase (no billing account yet); an existing
 * Stripe-backed subscription changes plan in place instead (ChangePlanDialog).
 */
export function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const interval = (searchParams.get("interval") === "yearly" ? "yearly" : "monthly") as BillingInterval;

  const subscriptionQuery = useSubscription();
  const plansQuery = usePlans();
  const kashierCheckout = useCreateKashierCheckout();
  const cashPayment = useCreateCashPayment();
  const [showCashForm, setShowCashForm] = useState(false);
  const [cashNote, setCashNote] = useState("");

  const plan = plansQuery.data?.find((p) => p.id === planId) ?? null;

  // No plan to check out with (bad/missing query param, or it no longer
  // exists) — nothing useful to render here, bounce back to plan selection.
  useEffect(() => {
    if (plansQuery.data && !plan) router.replace("/billing");
  }, [plansQuery.data, plan, router]);

  if (subscriptionQuery.isPending || plansQuery.isPending) return <CheckoutSkeleton />;

  if (subscriptionQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <ErrorState error={subscriptionQuery.error} onRetry={() => subscriptionQuery.refetch()} />
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <ErrorState error={plansQuery.error} onRetry={() => plansQuery.refetch()} />
      </div>
    );
  }

  if (!plan) return <CheckoutSkeleton />;

  const effectiveInterval: BillingInterval = interval === "yearly" && plan.billingYearlyEnabled ? "yearly" : "monthly";
  const priceCents = effectiveInterval === "yearly" ? plan.yearlyPriceCents : plan.monthlyPriceCents;

  async function handlePayWithKashier() {
    try {
      const { url } = await kashierCheckout.mutateAsync({ planId: plan!.id, billingInterval: effectiveInterval });
      redirectTo(url);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not start checkout for this plan.");
    }
  }

  async function handleCashSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await cashPayment.mutateAsync({ planId: plan!.id, billingInterval: effectiveInterval, note: cashNote.trim() || undefined });
      toast.success("Cash payment request submitted — an admin will review it shortly.");
      router.replace("/billing");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not submit the cash payment request.");
    }
  }

  const cashError = cashPayment.error instanceof ApiError ? cashPayment.error.message : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.replace("/billing")}>
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to plans
      </Button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Checkout</h2>
        <p className="text-sm text-muted-foreground">Review your order, then complete payment securely.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between text-base">
            <span>{plan.name}</span>
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {priceCents === 0 ? "Free" : formatMoneyCents(priceCents, plan.currency)}
              {priceCents > 0 ? <span className="text-sm font-normal text-muted-foreground"> / {effectiveInterval === "yearly" ? "year" : "month"}</span> : null}
            </span>
          </CardTitle>
          {plan.shortDescription ? <CardDescription>{plan.shortDescription}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-1.5 text-sm text-foreground">
            {planFeatureLines(plan).map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-primary" />
                {line}
              </li>
            ))}
          </ul>
          {plan.trialAvailable && plan.trialDays > 0 ? <p className="text-xs text-muted-foreground">Includes a {plan.trialDays}-day free trial.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
          <CardDescription>Your card details are entered on Kashier&apos;s own secure payment page — we never see or store them.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg" className="w-full justify-center" onClick={handlePayWithKashier} disabled={kashierCheckout.isPending}>
            {kashierCheckout.isPending ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Wallet className="size-4" data-icon="inline-start" />
            )}
            {kashierCheckout.isPending ? "Redirecting to secure payment…" : `Pay ${priceCents === 0 ? "" : formatMoneyCents(priceCents, plan.currency)} with Kashier`}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Encrypted checkout, powered by Kashier.
          </p>

          {!showCashForm ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => setShowCashForm(true)}
            >
              <Banknote className="size-3.5" />
              Prefer to pay by bank transfer or cash instead?
            </button>
          ) : (
            <form onSubmit={handleCashSubmit} className="flex flex-col gap-3 border-t border-border pt-3">
              <Field>
                <FieldLabel htmlFor="checkout-cash-note">Note for the admin reviewing this request</FieldLabel>
                <Textarea
                  id="checkout-cash-note"
                  value={cashNote}
                  onChange={(e) => setCashNote(e.target.value)}
                  placeholder="e.g. paying via bank transfer, reference #123"
                  maxLength={500}
                />
              </Field>
              {cashError ? (
                <Alert variant="destructive">
                  <AlertDescription>{cashError}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCashForm(false)} disabled={cashPayment.isPending}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={cashPayment.isPending}>
                  {cashPayment.isPending ? "Submitting…" : "Submit request"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
