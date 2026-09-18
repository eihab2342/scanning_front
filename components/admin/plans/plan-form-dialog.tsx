"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreatePlan, useUpdatePlan } from "@/lib/admin/api/use-plans";
import { ApiError } from "@/lib/admin/api/client";
import { AdminPlan, CreatePlanInput } from "@/lib/admin/api/types";

interface PlanFormDialogProps {
  plan: AdminPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  name: string;
  slug: string;
  shortDescription: string;
  monthlyPriceCents: string;
  yearlyPriceCents: string;
  currency: string;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  scanQuota: string;
  assetLimit: string;
  teamMemberLimit: string;
  isFeatured: boolean;
  isPublic: boolean;
  isActive: boolean;
  ctaLabel: string;
  trialAvailable: boolean;
  trialDays: string;
}

function initialState(plan: AdminPlan | null): FormState {
  return {
    name: plan?.name ?? "",
    slug: plan?.slug ?? "",
    shortDescription: plan?.shortDescription ?? "",
    monthlyPriceCents: String(plan?.monthlyPriceCents ?? 0),
    yearlyPriceCents: String(plan?.yearlyPriceCents ?? 0),
    currency: plan?.currency ?? "usd",
    billingMonthlyEnabled: plan?.billingMonthlyEnabled ?? true,
    billingYearlyEnabled: plan?.billingYearlyEnabled ?? false,
    scanQuota: String(plan?.scanQuota ?? 0),
    assetLimit: plan?.assetLimit != null ? String(plan.assetLimit) : "",
    teamMemberLimit: plan?.teamMemberLimit != null ? String(plan.teamMemberLimit) : "",
    isFeatured: plan?.isFeatured ?? false,
    isPublic: plan?.isPublic ?? true,
    isActive: plan?.isActive ?? true,
    ctaLabel: plan?.ctaLabel ?? "",
    trialAvailable: plan?.trialAvailable ?? false,
    trialDays: String(plan?.trialDays ?? 0),
  };
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-input" />
      {label}
    </label>
  );
}

export function PlanFormDialog({ plan, open, onOpenChange }: PlanFormDialogProps) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan(plan?.id ?? "");
  const [form, setForm] = useState<FormState>(initialState(plan));
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setForm(initialState(plan));
      setFieldError(null);
      createPlan.reset();
      updatePlan.reset();
    }
    onOpenChange(next);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!form.name.trim() || !form.slug.trim()) {
      setFieldError("Name and slug are required.");
      return;
    }
    if (!form.billingMonthlyEnabled && !form.billingYearlyEnabled) {
      setFieldError("At least one billing interval (monthly or yearly) must be enabled.");
      return;
    }

    const dto: CreatePlanInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      shortDescription: form.shortDescription.trim() || undefined,
      monthlyPriceCents: Number(form.monthlyPriceCents) || 0,
      yearlyPriceCents: Number(form.yearlyPriceCents) || 0,
      currency: form.currency.trim() || "usd",
      billingMonthlyEnabled: form.billingMonthlyEnabled,
      billingYearlyEnabled: form.billingYearlyEnabled,
      scanQuota: Number(form.scanQuota) || 0,
      assetLimit: form.assetLimit === "" ? undefined : Number(form.assetLimit),
      teamMemberLimit: form.teamMemberLimit === "" ? undefined : Number(form.teamMemberLimit),
      isFeatured: form.isFeatured,
      isPublic: form.isPublic,
      isActive: form.isActive,
      ctaLabel: form.ctaLabel.trim() || undefined,
      trialAvailable: form.trialAvailable,
      trialDays: form.trialAvailable ? Number(form.trialDays) || 0 : 0,
    };

    try {
      if (plan) {
        await updatePlan.mutateAsync(dto);
        toast.success(`${dto.name} updated.`);
      } else {
        await createPlan.mutateAsync(dto);
        toast.success(`${dto.name} created.`);
      }
      handleOpenChange(false);
    } catch {
      // surfaced below via mutation error
    }
  }

  const mutation = plan ? updatePlan : createPlan;
  const submitError = mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? `Edit ${plan.name}` : "Create plan"}</DialogTitle>
          <DialogDescription>Commercial plan fields — pricing, limits, trial, and visibility.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="plan-name">Name</FieldLabel>
              <Input id="plan-name" value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-slug">Slug</FieldLabel>
              <Input id="plan-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="pro" />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="plan-description">Short description</FieldLabel>
            <Input id="plan-description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="plan-monthly-price">Monthly price (cents)</FieldLabel>
              <Input id="plan-monthly-price" type="number" min={0} value={form.monthlyPriceCents} onChange={(e) => set("monthlyPriceCents", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-yearly-price">Yearly price (cents)</FieldLabel>
              <Input id="plan-yearly-price" type="number" min={0} value={form.yearlyPriceCents} onChange={(e) => set("yearlyPriceCents", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-currency">Currency</FieldLabel>
              <Input id="plan-currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} maxLength={3} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <ToggleField label="Monthly billing enabled" checked={form.billingMonthlyEnabled} onChange={(v) => set("billingMonthlyEnabled", v)} />
            <ToggleField label="Yearly billing enabled" checked={form.billingYearlyEnabled} onChange={(v) => set("billingYearlyEnabled", v)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="plan-scan-quota">Scan quota</FieldLabel>
              <Input id="plan-scan-quota" type="number" min={0} value={form.scanQuota} onChange={(e) => set("scanQuota", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-asset-limit">Asset limit</FieldLabel>
              <Input id="plan-asset-limit" type="number" min={0} value={form.assetLimit} onChange={(e) => set("assetLimit", e.target.value)} placeholder="Unlimited" />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-team-limit">Team member limit</FieldLabel>
              <Input id="plan-team-limit" type="number" min={0} value={form.teamMemberLimit} onChange={(e) => set("teamMemberLimit", e.target.value)} placeholder="Unlimited" />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <ToggleField label="Featured" checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <ToggleField label="Public (selectable)" checked={form.isPublic} onChange={(v) => set("isPublic", v)} />
            <ToggleField label="Active (usable)" checked={form.isActive} onChange={(v) => set("isActive", v)} />
          </div>

          <Field>
            <FieldLabel htmlFor="plan-cta">CTA label</FieldLabel>
            <Input id="plan-cta" value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="Get started" />
          </Field>

          <div className="flex flex-wrap items-end gap-4">
            <ToggleField label="Trial available" checked={form.trialAvailable} onChange={(v) => set("trialAvailable", v)} />
            {form.trialAvailable ? (
              <Field className="w-32">
                <FieldLabel htmlFor="plan-trial-days">Trial days</FieldLabel>
                <Input id="plan-trial-days" type="number" min={0} value={form.trialDays} onChange={(e) => set("trialDays", e.target.value)} />
              </Field>
            ) : null}
          </div>
          <FieldDescription>trialDays resolves to 0 automatically when trial is disabled.</FieldDescription>

          {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : plan ? "Save changes" : "Create plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
