"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSuspendOrganization } from "@/lib/admin/api/use-organizations";
import { ApiError } from "@/lib/admin/api/client";

interface SuspendOrganizationDialogProps {
  organizationId: string;
  organizationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendOrganizationDialog({ organizationId, organizationName, open, onOpenChange }: SuspendOrganizationDialogProps) {
  const suspend = useSuspendOrganization(organizationId);
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setReason("");
      setFieldError(null);
      suspend.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (reason.trim().length < 3) {
      setFieldError("Give a reason (at least 3 characters) — it's shown back to the organization and kept in the audit trail.");
      return;
    }
    try {
      await suspend.mutateAsync({ reason: reason.trim() });
      toast.success(`${organizationName} is now suspended.`);
      handleOpenChange(false);
    } catch {
      // surfaced below via suspend.error
    }
  }

  const submitError = suspend.error instanceof ApiError ? suspend.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend {organizationName}?</DialogTitle>
          <DialogDescription>
            This blocks new scans immediately. Members can still log in and see existing data — it&apos;s a reversible, fully-audited action.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(fieldError)}>
            <FieldLabel htmlFor="suspend-reason">Reason</FieldLabel>
            <Input id="suspend-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. repeated denied scan attempts" autoFocus />
            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </Field>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={suspend.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={suspend.isPending}>
              {suspend.isPending ? "Suspending…" : "Suspend organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
