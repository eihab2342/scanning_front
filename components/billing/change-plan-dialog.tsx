"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BillingInterval, PublicPlanView } from "@/lib/api/types";
import { formatMoneyCents } from "@/lib/format";

interface ChangePlanDialogProps {
  plan: PublicPlanView | null;
  interval: BillingInterval;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** Confirmation gate before changing an EXISTING Stripe-backed subscription — a fresh checkout (no subscription yet) skips this and redirects straight to Stripe. */
export function ChangePlanDialog({ plan, interval, isSubmitting, onOpenChange, onConfirm }: ChangePlanDialogProps) {
  const priceCents = interval === "yearly" ? plan?.yearlyPriceCents : plan?.monthlyPriceCents;

  return (
    <Dialog open={Boolean(plan)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change plan to {plan?.name}?</DialogTitle>
          <DialogDescription>
            {plan
              ? `Your subscription will switch to ${plan.name} (${priceCents === 0 ? "free" : formatMoneyCents(priceCents ?? 0, plan.currency)} / ${interval}), billed immediately with a prorated adjustment for the rest of this period.`
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Requesting…" : "Confirm change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
