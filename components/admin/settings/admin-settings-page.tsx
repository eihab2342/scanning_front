"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminPaymentsTab } from "./admin-payments-tab";

type SettingsTab = "payments";

const TABS: Array<{ value: SettingsTab; label: string }> = [{ value: "payments", label: "Payments" }];

/**
 * Platform-level config that isn't landing-page copy — brand/hero/SEO/legal
 * text lives in Website instead (see admin-website-page.tsx). Tabbed even
 * with a single tab today so a future platform-level setting (e.g. a second
 * payment gateway, feature flags) has a home without another reshuffle.
 */
export function AdminSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("payments");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Platform-level configuration — not landing-page copy (see Website for that).</p>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {TABS.map((t) => (
          <Button key={t.value} type="button" variant={tab === t.value ? "secondary" : "ghost"} size="sm" onClick={() => setTab(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">{tab === "payments" ? <AdminPaymentsTab /> : null}</div>
    </div>
  );
}
