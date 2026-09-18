"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Globe, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCreateAsset } from "@/lib/api/use-assets";
import { ApiError } from "@/lib/api/client";
import { VerificationMethod } from "@/lib/api/types";

const METHODS: Array<{ value: VerificationMethod; icon: React.ElementType; label: string; description: string }> = [
  { value: "dns_txt", icon: Globe, label: "DNS TXT Record", description: "Add a TXT record through your DNS provider." },
  { value: "http_file", icon: FileText, label: "HTTP File", description: "Publish a file at a specific path on the domain." },
];

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atLimit: boolean;
  limitDescription?: string;
}

export function AddAssetDialog({ open, onOpenChange, atLimit, limitDescription }: AddAssetDialogProps) {
  const router = useRouter();
  const createAsset = useCreateAsset();
  const [hostname, setHostname] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("dns_txt");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function reset() {
    setHostname("");
    setMethod("dns_txt");
    setFieldError(null);
    createAsset.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const value = hostname.trim().toLowerCase();
    if (!value) {
      setFieldError("Enter a domain, e.g. example.com");
      return;
    }

    try {
      const result = await createAsset.mutateAsync({ type: "domain", value, verificationMethod: method });
      toast.success(`${result.asset.hostname} was added — verify ownership to unlock scanning.`);
      handleOpenChange(false);
      router.push(`/assets/${result.asset.id}`);
    } catch {
      // Surfaced below via createAsset.error — including the race where the
      // backend rejects for asset-limit-reached even though the frontend
      // thought there was capacity (isPending state above may be stale).
    }
  }

  const submitError = createAsset.error instanceof ApiError ? createAsset.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add asset</DialogTitle>
          <DialogDescription>Add a domain you own, then verify ownership before scanning it.</DialogDescription>
        </DialogHeader>

        {atLimit ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>{limitDescription ?? "Your current plan's asset limit has been reached."}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="asset-hostname">Domain</FieldLabel>
              <Input
                id="asset-hostname"
                placeholder="example.com"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                autoFocus
                aria-invalid={Boolean(fieldError)}
              />
              <FieldDescription>e.g. example.com or app.example.com</FieldDescription>
              {fieldError ? <FieldError>{fieldError}</FieldError> : null}
            </Field>

            <Field>
              <FieldLabel>Verification method</FieldLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {METHODS.map((option) => {
                  const Icon = option.icon;
                  const selected = method === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMethod(option.value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors",
                        selected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            {submitError ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createAsset.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAsset.isPending}>
                {createAsset.isPending ? "Adding…" : "Add asset"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
