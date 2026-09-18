"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminSettings, useUpdateAdminSettings } from "@/lib/admin/api/use-settings";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminPlatformSettings, UpdatePlatformSettingsInput } from "@/lib/admin/api/types";

type TextFieldKey = {
  [K in keyof UpdatePlatformSettingsInput]-?: NonNullable<UpdatePlatformSettingsInput[K]> extends string ? K : never;
}[keyof UpdatePlatformSettingsInput];

export interface SectionFieldDef {
  key: TextFieldKey;
  label: string;
  type?: "text" | "email" | "url" | "textarea";
  placeholder?: string;
  description?: string;
  maxLength?: number;
}

/**
 * One focused settings card — a handful of related PlatformSettings text
 * fields with their own "Save" button, so editing one landing section (or
 * the SEO block, or Support links) doesn't require scrolling through every
 * other unrelated field on the same page (see the old single giant Settings
 * form this replaced). Every section reads/writes the same singleton
 * PlatformSettings row via a partial PATCH — only this card's own fields are
 * ever sent.
 */
export function SettingsSectionForm({ title, description, fields }: { title: string; description?: string; fields: SectionFieldDef[] }) {
  const settingsQuery = useAdminSettings();
  const { admin } = useAdminAuth();
  const canWrite = canPerform(admin?.role, "platform_settings.manage");

  if (settingsQuery.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-24 animate-pulse rounded-md bg-muted" />
      </Card>
    );
  }

  if (settingsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertDescription>{settingsQuery.error instanceof ApiError ? settingsQuery.error.message : "Failed to load settings."}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <SettingsSectionFormBody title={title} description={description} fields={fields} settings={settingsQuery.data} canWrite={canWrite} />;
}

// Split out so its form-state useState only ever seeds once real data
// exists, same reasoning as AdminSettingsForm previously used for the one
// big form this replaced.
function SettingsSectionFormBody({
  title,
  description,
  fields,
  settings,
  canWrite,
}: {
  title: string;
  description?: string;
  fields: SectionFieldDef[];
  settings: AdminPlatformSettings;
  canWrite: boolean;
}) {
  const updateSettings = useUpdateAdminSettings();
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, (settings[f.key as keyof AdminPlatformSettings] as string | null) ?? ""])),
  );

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Same "empty means omit, not clear" rule as the rest of admin settings
    // — an empty optional field (IsUrl/IsEmail reject "") is left out rather
    // than sent, so this endpoint only ever sets a new value, never clears one.
    const dto: UpdatePlatformSettingsInput = {};
    for (const field of fields) {
      const value = form[field.key]?.trim() ?? "";
      if (value !== "") (dto as Record<string, string>)[field.key] = value;
    }
    try {
      await updateSettings.mutateAsync(dto);
      toast.success(`${title} saved.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings.");
    }
  }

  const submitError = updateSettings.error instanceof ApiError ? updateSettings.error.message : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {fields.map((field) => (
            <Field key={field.key}>
              <FieldLabel htmlFor={`section-${field.key}`}>{field.label}</FieldLabel>
              {field.type === "textarea" ? (
                <Textarea
                  id={`section-${field.key}`}
                  value={form[field.key] ?? ""}
                  disabled={!canWrite}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key, e.target.value)}
                />
              ) : (
                <Input
                  id={`section-${field.key}`}
                  type={field.type === "email" || field.type === "url" ? field.type : "text"}
                  value={form[field.key] ?? ""}
                  disabled={!canWrite}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key, e.target.value)}
                />
              )}
              {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
            </Field>
          ))}

          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        {canWrite ? (
          <div className="flex justify-end px-6 pt-2">
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
