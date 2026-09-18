import { Check, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingInterval, PublicPlanView } from "@/lib/api/types";
import { formatMoneyCents } from "@/lib/format";
import { cn } from "@/lib/utils";

function featureLine(feature: PublicPlanView["features"][number]): string {
  if (feature.type === "BOOLEAN") return feature.name;
  const unit = feature.unit ? ` ${feature.unit}` : "";
  return `${feature.name}: ${feature.value}${unit}`;
}

export function PlanCard({
  plan,
  interval,
  isCurrent,
  canChoose,
  pending,
  onChoose,
}: {
  plan: PublicPlanView;
  interval: BillingInterval;
  isCurrent: boolean;
  canChoose: boolean;
  pending: boolean;
  onChoose: () => void;
}) {
  // A plan may not offer the globally-selected interval — show whichever it
  // actually supports rather than hiding the card or a broken price.
  const effectiveInterval: BillingInterval =
    interval === "yearly" && plan.billingYearlyEnabled ? "yearly" : plan.billingMonthlyEnabled ? "monthly" : "yearly";
  const priceCents = effectiveInterval === "yearly" ? plan.yearlyPriceCents : plan.monthlyPriceCents;

  return (
    <Card size="sm" className={cn("relative flex flex-col", plan.isFeatured && "ring-2 ring-primary")}>
      {plan.isFeatured ? (
        <Badge className="absolute -top-2.5 right-4 gap-1">
          <Star className="size-3" data-icon="inline-start" />
          Popular
        </Badge>
      ) : null}
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {plan.name}
          {isCurrent ? <Badge variant="secondary">Current plan</Badge> : null}
        </CardTitle>
        {plan.shortDescription ? <p className="text-sm text-muted-foreground">{plan.shortDescription}</p> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-4">
        <div>
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {priceCents === 0 ? "Free" : formatMoneyCents(priceCents, plan.currency)}
          </span>
          {priceCents > 0 ? <span className="text-sm text-muted-foreground"> / {effectiveInterval === "yearly" ? "year" : "month"}</span> : null}
          {interval !== effectiveInterval ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{effectiveInterval === "monthly" ? "Monthly billing only" : "Yearly billing only"}</p>
          ) : null}
        </div>

        <ul className="flex flex-col gap-1.5 text-sm text-foreground">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-primary" />
            {plan.scanQuota} scans / period
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-primary" />
            {plan.assetLimit === null ? "Unlimited assets" : `${plan.assetLimit} assets`}
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 shrink-0 text-primary" />
            {plan.teamMemberLimit === null ? "Unlimited team members" : `${plan.teamMemberLimit} team members`}
          </li>
          {plan.features.map((feature) => (
            <li key={feature.key} className="flex items-center gap-2">
              <Check className="size-3.5 shrink-0 text-primary" />
              {featureLine(feature)}
            </li>
          ))}
        </ul>

        {plan.trialAvailable && plan.trialDays > 0 ? (
          <p className="text-xs text-muted-foreground">{plan.trialDays}-day free trial</p>
        ) : null}

        <div className="mt-auto pt-2">
          {canChoose ? (
            <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled={isCurrent || pending} onClick={onChoose}>
              {isCurrent ? "Current plan" : (plan.ctaLabel ?? "Choose plan")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
