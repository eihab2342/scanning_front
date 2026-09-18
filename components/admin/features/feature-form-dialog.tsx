"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCreateFeature, useUpdateFeature } from "@/lib/admin/api/use-features";
import { ApiError } from "@/lib/admin/api/client";
import { AdminFeature, FeatureType } from "@/lib/admin/api/types";

interface FeatureFormDialogProps {
  feature: AdminFeature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureFormDialog({ feature, open, onOpenChange }: FeatureFormDialogProps) {
  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature(feature?.id ?? "");
  const [key, setKey] = useState(feature?.key ?? "");
  const [name, setName] = useState(feature?.name ?? "");
  const [description, setDescription] = useState(feature?.description ?? "");
  const [type, setType] = useState<FeatureType>(feature?.type ?? "BOOLEAN");
  const [unit, setUnit] = useState(feature?.unit ?? "");
  const [isActive, setIsActive] = useState(feature?.isActive ?? true);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setKey(feature?.key ?? "");
      setName(feature?.name ?? "");
      setDescription(feature?.description ?? "");
      setType(feature?.type ?? "BOOLEAN");
      setUnit(feature?.unit ?? "");
      setIsActive(feature?.isActive ?? true);
      setFieldError(null);
      createFeature.reset();
      updateFeature.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!name.trim()) {
      setFieldError("Name is required.");
      return;
    }
    if (!feature && !/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(key.trim())) {
      setFieldError('Key must be lowercase snake_case starting with a letter (e.g. "api_access").');
      return;
    }

    try {
      if (feature) {
        await updateFeature.mutateAsync({ name: name.trim(), description: description.trim() || undefined, unit: unit.trim() || undefined, isActive });
        toast.success(`${name} updated.`);
      } else {
        await createFeature.mutateAsync({ key: key.trim(), name: name.trim(), description: description.trim() || undefined, type, unit: unit.trim() || undefined, isActive });
        toast.success(`${name} created.`);
      }
      handleOpenChange(false);
    } catch {
      // surfaced below via mutation error
    }
  }

  const mutation = feature ? updateFeature : createFeature;
  const submitError = mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{feature ? `Edit ${feature.name}` : "Create feature"}</DialogTitle>
          <DialogDescription>{feature ? "Key and type are immutable once created." : "The catalog entry for a product feature/entitlement."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(fieldError)}>
            <FieldLabel htmlFor="feature-key">Key</FieldLabel>
            <Input id="feature-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="api_access" disabled={Boolean(feature)} autoFocus={!feature} />
            {!feature ? <FieldDescription>Lowercase snake_case, cannot be changed later.</FieldDescription> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="feature-name">Name</FieldLabel>
            <Input id="feature-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus={Boolean(feature)} />
            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="feature-description">Description</FieldLabel>
            <Input id="feature-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <div className="flex gap-1.5">
              {(["BOOLEAN", "QUANTITY"] as FeatureType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(feature)}
                  onClick={() => setType(option)}
                  aria-pressed={type === option}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm transition-colors",
                    type === option ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                    Boolean(feature) && "opacity-50",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          {type === "QUANTITY" ? (
            <Field>
              <FieldLabel htmlFor="feature-unit">Unit</FieldLabel>
              <Input id="feature-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. seats" />
            </Field>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 rounded border-input" />
            Active
          </label>

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
              {mutation.isPending ? "Saving…" : feature ? "Save changes" : "Create feature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
