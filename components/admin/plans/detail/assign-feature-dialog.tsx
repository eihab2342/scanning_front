"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAssignPlanFeature } from "@/lib/admin/api/use-plans";
import { ApiError } from "@/lib/admin/api/client";
import { AdminFeature, AdminPlanFeature } from "@/lib/admin/api/types";

interface AssignFeatureDialogProps {
  planId: string;
  feature: AdminFeature;
  existing: AdminPlanFeature | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignFeatureDialog({ planId, feature, existing, open, onOpenChange }: AssignFeatureDialogProps) {
  const assign = useAssignPlanFeature(planId);
  const [boolValue, setBoolValue] = useState(existing?.boolValue ?? true);
  const [limitValue, setLimitValue] = useState(existing?.limitValue != null ? String(existing.limitValue) : "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setBoolValue(existing?.boolValue ?? true);
      setLimitValue(existing?.limitValue != null ? String(existing.limitValue) : "");
      setFieldError(null);
      assign.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (feature.type === "QUANTITY") {
      const numeric = Number(limitValue);
      if (limitValue === "" || Number.isNaN(numeric) || numeric < 0) {
        setFieldError("Enter a non-negative number.");
        return;
      }
    }

    try {
      await assign.mutateAsync({
        featureId: feature.id,
        dto: feature.type === "BOOLEAN" ? { boolValue } : { limitValue: Number(limitValue) },
      });
      toast.success(`${feature.name} assigned to this plan.`);
      handleOpenChange(false);
    } catch {
      // surfaced below via assign.error
    }
  }

  const submitError = assign.error instanceof ApiError ? assign.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? "Update" : "Assign"} {feature.name}</DialogTitle>
          <DialogDescription>
            {feature.type === "BOOLEAN" ? "This feature is a true/false switch for this plan." : "This feature is a numeric limit for this plan."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {feature.type === "BOOLEAN" ? (
            <Field>
              <FieldLabel>Value</FieldLabel>
              <div className="flex gap-1.5">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setBoolValue(value)}
                    aria-pressed={boolValue === value}
                    className={cn(
                      "rounded-md border px-3 py-1 text-sm transition-colors",
                      boolValue === value ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                    )}
                  >
                    {value ? "True" : "False"}
                  </button>
                ))}
              </div>
            </Field>
          ) : (
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="feature-limit-value">Limit{feature.unit ? ` (${feature.unit})` : ""}</FieldLabel>
              <Input id="feature-limit-value" type="number" min={0} value={limitValue} onChange={(e) => setLimitValue(e.target.value)} autoFocus />
              {fieldError ? <FieldError>{fieldError}</FieldError> : null}
            </Field>
          )}

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={assign.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={assign.isPending}>
              {assign.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
