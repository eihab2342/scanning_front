"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChangePassword } from "@/lib/api/use-profile";
import { ApiError } from "@/lib/api/client";

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="pr-8" />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
    </Field>
  );
}

/**
 * Fields are plain component state only — never persisted to localStorage
 * or anywhere else, and cleared on a successful change.
 */
export function SecurityTab() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setSucceeded(false);

    if (newPassword.length < 8) {
      setFieldError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError("Passwords don't match.");
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSucceeded(true);
      toast.success("Password updated");
    } catch {
      // Surfaced below via changePassword.error.
    }
  }

  const submitError = changePassword.error instanceof ApiError ? changePassword.error.message : null;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change the password used to log in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PasswordField id="current-password" label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          <PasswordField id="new-password" label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordField id="confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {fieldError ? <FieldError>{fieldError}</FieldError> : null}

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {succeeded ? (
            <Alert>
              <CheckCircle2 />
              <AlertDescription>Your password has been updated.</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
