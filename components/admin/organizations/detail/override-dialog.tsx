"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpsertSubscriptionOverride } from "@/lib/admin/api/use-organizations";
import { ApiError } from "@/lib/admin/api/client";
import { SubscriptionOverride, SubscriptionOverrideKey } from "@/lib/admin/api/types";

const KEY_LABELS: Record<SubscriptionOverrideKey, string> = {
  scan_quota: "Scan quota",
  asset_limit: "Asset limit",
  team_member_limit: "Team member limit",
};

interface OverrideDialogProps {
  organizationId: string;
  overrideKey: SubscriptionOverrideKey;
  existing: SubscriptionOverride | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OverrideDialog({ organizationId, overrideKey, existing, open, onOpenChange }: OverrideDialogProps) {
  const upsert = useUpsertSubscriptionOverride(organizationId);
  const [value, setValue] = useState(existing ? String(existing.value) : "");
  const [reason, setReason] = useState(existing?.reason ?? "");
  const [expiresAt, setExpiresAt] = useState(existing?.expiresAt ? existing.expiresAt.slice(0, 10) : "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setValue(existing ? String(existing.value) : "");
      setReason(existing?.reason ?? "");
      setExpiresAt(existing?.expiresAt ? existing.expiresAt.slice(0, 10) : "");
      setFieldError(null);
      upsert.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    const numericValue = Number(value);
    if (value === "" || Number.isNaN(numericValue) || numericValue < 0) {
      setFieldError("Enter a non-negative number.");
      return;
    }
    try {
      await upsert.mutateAsync({
        key: overrideKey,
        dto: {
          value: numericValue,
          reason: reason.trim() || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      });
      toast.success(`${KEY_LABELS[overrideKey]} override saved.`);
      handleOpenChange(false);
    } catch {
      // surfaced below via upsert.error
    }
  }

  const submitError = upsert.error instanceof ApiError ? upsert.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? "Update" : "Create"} {KEY_LABELS[overrideKey]} override</DialogTitle>
          <DialogDescription>Overrides an individual organization above/below its plan&apos;s default, without changing the Plan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(fieldError)}>
            <FieldLabel htmlFor="override-value">Value</FieldLabel>
            <Input id="override-value" type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="override-reason">Reason</FieldLabel>
            <Input id="override-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="optional" />
          </Field>

          <Field>
            <FieldLabel htmlFor="override-expires">Expires</FieldLabel>
            <Input id="override-expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            <FieldDescription>Leave blank for no expiry.</FieldDescription>
          </Field>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={upsert.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? "Saving…" : "Save override"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
