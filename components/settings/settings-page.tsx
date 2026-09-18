"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeneralSettingsTab } from "./general-settings-tab";
import { AccountTab } from "./account-tab";
import { SecurityTab } from "./security-tab";
import { usePermissions } from "@/lib/auth/permissions-context";

type SettingsTab = "general" | "account" | "security";

/**
 * "My Account"/"Security" are available to every role (profile.view /
 * profile.change_password — a personal concern, independent of
 * organization.update), while "General" (organization-wide settings)
 * follows organization.update — kept as tabs on one page rather than a
 * separate route, per the team-management phase's "don't conflate My
 * Account with Organization Settings" note: the tab gating does that
 * separation, not the URL.
 */
export function SettingsPage() {
  const { can } = usePermissions();
  const canEditOrganization = can("organization.update");
  const [tab, setTab] = useState<SettingsTab>(canEditOrganization ? "general" : "account");

  const tabs: Array<{ value: SettingsTab; label: string }> = [
    ...(canEditOrganization ? [{ value: "general" as const, label: "General" }] : []),
    { value: "account", label: "Account" },
    { value: "security", label: "Security" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col gap-1 px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your organization and personal account.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {tabs.map((t) => (
          <Button key={t.value} type="button" variant={tab === t.value ? "secondary" : "ghost"} size="sm" onClick={() => setTab(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">
        {tab === "general" && canEditOrganization ? <GeneralSettingsTab /> : null}
        {tab === "account" ? <AccountTab /> : null}
        {tab === "security" ? <SecurityTab /> : null}
      </div>
    </div>
  );
}
