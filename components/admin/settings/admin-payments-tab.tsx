"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSettings, useUpdateAdminSettings } from "@/lib/admin/api/use-settings";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminPlatformSettings, UpdatePlatformSettingsInput } from "@/lib/admin/api/types";

interface FormState {
  kashierEnabled: boolean;
  kashierMode: string;
  kashierMerchantId: string;
  kashierApiKey: string;
  kashierSecretKey: string;
}

function toFormState(settings: AdminPlatformSettings): FormState {
  return {
    kashierEnabled: settings.kashierEnabled,
    kashierMode: settings.kashierMode || "test",
    kashierMerchantId: settings.kashierMerchantId ?? "",
    kashierApiKey: settings.kashierApiKey ?? "",
    kashierSecretKey: "",
  };
}

export function AdminPaymentsTab() {
  const settingsQuery = useAdminSettings();

  if (settingsQuery.isPending) return <Skeleton className="h-80 rounded-lg" />;
  if (settingsQuery.isError) return <ErrorState error={settingsQuery.error} onRetry={() => settingsQuery.refetch()} />;

  return <KashierForm settings={settingsQuery.data} />;
}

// Separate so the form state's useState initializer only ever runs once
// real data exists (see AdminWebsitePage's per-tab forms for the same shape).
function KashierForm({ settings }: { settings: AdminPlatformSettings }) {
  const { admin } = useAdminAuth();
  const updateSettings = useUpdateAdminSettings();
  const canWrite = canPerform(admin?.role, "platform_settings.manage");
  const [form, setForm] = useState<FormState>(() => toFormState(settings));

  function set<K extends Exclude<keyof FormState, "kashierEnabled">>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // kashierEnabled is a real boolean (always sent as-is); kashierSecretKey
    // is write-only (blank means "keep the current secret", so it's only
    // sent when typed); everything else follows the same "empty means omit"
    // rule as the rest of admin settings.
    const dto: UpdatePlatformSettingsInput = { kashierEnabled: form.kashierEnabled };
    if (form.kashierMode.trim() !== "") dto.kashierMode = form.kashierMode.trim();
    if (form.kashierMerchantId.trim() !== "") dto.kashierMerchantId = form.kashierMerchantId.trim();
    if (form.kashierApiKey.trim() !== "") dto.kashierApiKey = form.kashierApiKey.trim();
    if (form.kashierSecretKey.trim() !== "") dto.kashierSecretKey = form.kashierSecretKey.trim();

    try {
      await updateSettings.mutateAsync(dto);
      toast.success("Payment settings saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings.");
    }
  }

  const submitError = updateSettings.error instanceof ApiError ? updateSettings.error.message : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kashier (Egyptian payment gateway)</CardTitle>
          <CardDescription>
            Temporary, admin-managed credentials so checkout can be tested end-to-end without a redeploy. Leave off in production until real merchant
            credentials are in place.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="kashierEnabled">Enabled</FieldLabel>
            <label className="flex items-center gap-2 text-sm">
              <input
                id="kashierEnabled"
                type="checkbox"
                checked={form.kashierEnabled}
                disabled={!canWrite}
                onChange={(e) => setForm((prev) => ({ ...prev, kashierEnabled: e.target.checked }))}
                className="h-4 w-4"
              />
              {form.kashierEnabled ? "Kashier checkout is live for tenants" : "Kashier checkout is off"}
            </label>
          </Field>
          <Field>
            <FieldLabel htmlFor="kashierMode">Mode</FieldLabel>
            <select
              id="kashierMode"
              value={form.kashierMode}
              disabled={!canWrite}
              onChange={(e) => set("kashierMode", e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="kashierMerchantId">Merchant ID</FieldLabel>
            <Input id="kashierMerchantId" value={form.kashierMerchantId} disabled={!canWrite} onChange={(e) => set("kashierMerchantId", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="kashierApiKey">API key</FieldLabel>
            <Input id="kashierApiKey" value={form.kashierApiKey} disabled={!canWrite} onChange={(e) => set("kashierApiKey", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="kashierSecretKey">Secret key</FieldLabel>
            <Input
              id="kashierSecretKey"
              type="password"
              value={form.kashierSecretKey}
              disabled={!canWrite}
              onChange={(e) => set("kashierSecretKey", e.target.value)}
              placeholder={settings.kashierSecretKeySet ? "•••••••• (set — leave blank to keep)" : "Not set"}
            />
            <FieldDescription>Never shown once saved — leave blank to keep the current secret.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      {submitError ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {canWrite ? (
        <div>
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Your role doesn&apos;t permit editing platform settings.</p>
      )}
    </form>
  );
}
