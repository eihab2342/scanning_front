"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useImpersonateOrganization } from "@/lib/admin/api/use-organizations";
import { ApiError } from "@/lib/admin/api/client";
import { setTokens } from "@/lib/auth/token-store";
import { setImpersonationSession } from "@/lib/auth/impersonation";

interface ImpersonateDialogProps {
  organizationId: string;
  organizationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Issuing the token hands this browser a completely ordinary tenant
 * session (see ImpersonationService's doc comment) — we store it in the
 * TENANT token store (not the admin one) and navigate into the tenant app,
 * exactly like a normal login would, while the admin's own session stays
 * live and separate the whole time.
 */
export function ImpersonateDialog({ organizationId, organizationName, open, onOpenChange }: ImpersonateDialogProps) {
  const router = useRouter();
  const impersonate = useImpersonateOrganization(organizationId);
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setReason("");
      setFieldError(null);
      impersonate.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (reason.trim().length < 3) {
      setFieldError("Give a reason (at least 3 characters) — every impersonation session is audited with who, which org, when, and why.");
      return;
    }
    try {
      const result = await impersonate.mutateAsync({ reason: reason.trim() });
      setTokens({ accessToken: result.accessToken, refreshToken: "" });
      setImpersonationSession({
        organizationId: result.organization.id,
        organizationName: result.organization.name,
        actingAsEmail: result.actingAs.email,
        startedAt: Date.now(),
        expiresInSeconds: result.expiresInSeconds,
      });
      handleOpenChange(false);
      router.push("/dashboard");
    } catch {
      // surfaced below via impersonate.error
    }
  }

  const submitError = impersonate.error instanceof ApiError ? impersonate.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-4 text-amber-500" aria-hidden="true" />
            Impersonate {organizationName}?
          </DialogTitle>
          <DialogDescription>
            Opens a 15-minute tenant session as this organization&apos;s owner, in this browser. Fully audited at issuance — this is never silent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(fieldError)}>
            <FieldLabel htmlFor="impersonate-reason">Reason</FieldLabel>
            <Input id="impersonate-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. investigating a support ticket" autoFocus />
            {fieldError ? <FieldError>{fieldError}</FieldError> : null}
          </Field>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={impersonate.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={impersonate.isPending}>
              {impersonate.isPending ? "Starting…" : "Start impersonation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
