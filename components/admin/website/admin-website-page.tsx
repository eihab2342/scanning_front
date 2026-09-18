"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminCmsPagesTab } from "./admin-cms-pages-tab";
import { WebsiteGeneralTab } from "./website-general-tab";
import { WebsiteHeroTab } from "./website-hero-tab";
import { WebsiteHowItWorksTab } from "./website-how-it-works-tab";
import { WebsiteFeaturesTab } from "./website-features-tab";
import { WebsiteSecurityTab } from "./website-security-tab";
import { WebsitePricingTab } from "./website-pricing-tab";
import { WebsiteFaqTab } from "./website-faq-tab";
import { WebsiteCtaFooterTab } from "./website-cta-footer-tab";

type WebsiteTab = "general" | "hero" | "how_it_works" | "features" | "security" | "pricing" | "faq" | "cta_footer" | "pages";

const TABS: Array<{ value: WebsiteTab; label: string }> = [
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "how_it_works", label: "How it works" },
  { value: "features", label: "Features" },
  { value: "security", label: "Security" },
  { value: "pricing", label: "Pricing" },
  { value: "faq", label: "FAQ" },
  { value: "cta_footer", label: "CTA & footer" },
  { value: "pages", label: "Pages" },
];

/**
 * Everything that shapes the public landing page in one place, organized
 * per-section — each tab holds that section's heading AND its content
 * together (e.g. Features = the section title/subtitle + the feature cards
 * themselves), instead of the old split where headings lived in Settings and
 * card content lived in a separate Content page. Settings (see
 * admin-settings-page.tsx) now only holds platform-level config that isn't
 * landing-page copy, e.g. payment gateway credentials.
 */
export function AdminWebsitePage() {
  const [tab, setTab] = useState<WebsiteTab>("general");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Website</h2>
        <p className="text-sm text-muted-foreground">Brand, every section of the landing page, legal pages, and SEO — all editable without a deploy.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {TABS.map((t) => (
          <Button key={t.value} type="button" variant={tab === t.value ? "secondary" : "ghost"} size="sm" onClick={() => setTab(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">
        {tab === "general" ? <WebsiteGeneralTab /> : null}
        {tab === "hero" ? <WebsiteHeroTab /> : null}
        {tab === "how_it_works" ? <WebsiteHowItWorksTab /> : null}
        {tab === "features" ? <WebsiteFeaturesTab /> : null}
        {tab === "security" ? <WebsiteSecurityTab /> : null}
        {tab === "pricing" ? <WebsitePricingTab /> : null}
        {tab === "faq" ? <WebsiteFaqTab /> : null}
        {tab === "cta_footer" ? <WebsiteCtaFooterTab /> : null}
        {tab === "pages" ? <AdminCmsPagesTab /> : null}
      </div>
    </div>
  );
}
