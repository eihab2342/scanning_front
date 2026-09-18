"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, Shuffle } from "lucide-react";
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
import { useInviteMember } from "@/lib/api/use-team";
import { ApiError } from "@/lib/api/client";
import { Role } from "@/lib/api/types";
import { assignableRoles, roleDescription, roleLabel } from "@/lib/role";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actorRole: Role;
  atLimit: boolean;
  limitDescription?: string;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 14; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function InviteMemberDialog({ open, onOpenChange, actorRole, atLimit, limitDescription }: InviteMemberDialogProps) {
  const inviteMember = useInviteMember();
  const options = assignableRoles(actorRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(options.includes("member") ? "member" : options[options.length - 1]);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole(options.includes("member") ? "member" : options[options.length - 1]);
    setFieldError(null);
    inviteMember.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!email.trim()) {
      setFieldError("Enter the new member's email address.");
      return;
    }
    if (password.length < 8) {
      setFieldError("The temporary password must be at least 8 characters.");
      return;
    }

    try {
      const created = await inviteMember.mutateAsync({ email: email.trim().toLowerCase(), password, role });
      toast.success(`${created.email} was added — share their temporary password so they can log in.`);
      handleOpenChange(false);
    } catch {
      // Surfaced below via inviteMember.error — including the race where the
      // backend rejects for team-limit-reached even though the frontend
      // thought there was capacity.
    }
  }

  const submitError = inviteMember.error instanceof ApiError ? inviteMember.error.message : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            This creates their account directly with a temporary password — share it with them so they can log in and change it.
          </DialogDescription>
        </DialogHeader>

        {atLimit ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>{limitDescription ?? "Your current plan's team member limit has been reached."}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="off"
              />
            </Field>

            <Field data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor="invite-password">Temporary password</FieldLabel>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Input
                    id="invite-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setPassword(generatePassword())} aria-label="Generate a password">
                  <Shuffle className="size-4" />
                </Button>
              </div>
              <FieldDescription>At least 8 characters.</FieldDescription>
              {fieldError ? <FieldError>{fieldError}</FieldError> : null}
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <div className="flex flex-col gap-1.5">
                {options.map((option) => {
                  const selected = role === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border p-2.5 text-left transition-colors",
                        selected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{roleLabel(option)}</span>
                      <span className="text-xs text-muted-foreground">{roleDescription(option)}</span>
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={inviteMember.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? "Inviting…" : "Invite member"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
