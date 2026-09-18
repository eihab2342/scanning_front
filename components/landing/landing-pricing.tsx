"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMoneyCents } from "@/lib/format";
import { PublicPlan } from "@/lib/public/types";

type Interval = "monthly" | "yearly";

function planLimits(plan: PublicPlan): string[] {
  return [
    `${plan.scanQuota} scans / period`,
    plan.assetLimit != null ? `${plan.assetLimit} assets` : "Unlimited assets",
    plan.teamMemberLimit != null ? `${plan.teamMemberLimit} team members` : "Unlimited team members",
  ];
}

function featureLines(plan: PublicPlan): string[] {
  return plan.features
    .filter((f) => f.type !== "BOOLEAN" || f.value === true)
    .map((f) => (f.type === "BOOLEAN" ? f.name : `${f.value}${f.unit ? ` ${f.unit}` : ""} ${f.name}`));
}

export function LandingPricing({ title, description, plans }: { title: string; description: string; plans: PublicPlan[] }) {
  const anyYearly = plans.some((p) => p.billingYearlyEnabled);
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <section id="pricing" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        {anyYearly ? (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              {(["monthly", "yearly"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInterval(option)}
                  aria-pressed={interval === option}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                    interval === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {plans.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Pricing is being finalized — get in touch and we&apos;ll set you up.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const usesYearly = interval === "yearly" && plan.billingYearlyEnabled;
              const priceCents = usesYearly ? plan.yearlyPriceCents : plan.monthlyPriceCents;
              return (
                <Card key={plan.id} className={cn("relative py-6", plan.isFeatured && "border-primary/50 shadow-sm ring-1 ring-primary/20")}>
                  {plan.isFeatured ? <Badge className="absolute -top-2.5 left-6">Most popular</Badge> : null}
                  <CardHeader className="px-6">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    {plan.shortDescription ? <p className="text-sm text-muted-foreground">{plan.shortDescription}</p> : null}
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight text-foreground">{formatMoneyCents(priceCents, plan.currency)}</span>
                      <span className="text-sm text-muted-foreground">/{usesYearly ? "yr" : "mo"}</span>
                    </div>
                    {plan.trialAvailable ? <p className="mt-1 text-xs text-muted-foreground">{plan.trialDays}-day free trial</p> : null}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 px-6">
                    <ul className="flex flex-col gap-2">
                      {[...planLimits(plan), ...featureLines(plan)].map((line) => (
                        <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-auto" variant={plan.isFeatured ? "default" : "outline"} nativeButton={false} render={<Link href="/signup" />}>
                      {plan.ctaLabel || "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
