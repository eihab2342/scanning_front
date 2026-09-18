import type { Metadata } from "next";
import { getPublicConfig, getPublicPlans, getPublicLandingContent } from "@/lib/public/api";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingSecurity } from "@/components/landing/landing-security";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

// Content depends on live, admin-editable PlatformSettings/Plan data (see
// the phase brief: "changes should appear on the public site after save
// without code changes") — never statically prerendered/cached at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicConfig();
  const title = config.seoTitle || `${config.platformName} — Verify before you scan`;
  const description =
    config.seoDescription || config.heroDescription || `${config.platformName} verifies asset ownership before any security scan is allowed to run.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(config.logoUrl ? { images: [{ url: config.logoUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// The public homepage — deliberately separate from the authenticated
// dashboard shell (see (app)/layout.tsx). An authenticated visitor is still
// shown this page (no redirect to /dashboard here or anywhere upstream);
// LandingHeader just swaps its CTA for a "Go to dashboard" link once a
// tenant session exists.
export default async function LandingPage() {
  const [config, plans, landingContent] = await Promise.all([getPublicConfig(), getPublicPlans(), getPublicLandingContent()]);

  const heroBadgeText = config.heroBadgeText || "Ownership-verified scanning";
  const heroTitle = config.heroTitle || `${config.platformName}: verify ownership before you scan`;
  const heroDescription =
    config.heroDescription ||
    "An enforcement gate sits in front of every scan — asset ownership, subscription status, and quota are all checked first, and every decision is logged.";

  const howItWorksTitle = config.howItWorksTitle || "How it works";
  const howItWorksDescription =
    config.howItWorksDescription || "A verification gate sits in front of every scan — ownership is proven before anything runs.";

  const featuresSectionTitle = config.featuresSectionTitle || "Everything the gate needs";
  const featuresSectionDescription = config.featuresSectionDescription || "Built around one rule: nothing gets scanned until it's verified.";

  const securityTitle = config.securityTitle || "Built to keep scans honest";
  const securityDescription = config.securityDescription || "The controls that make the verification gate mean something.";

  const pricingTitle = config.pricingTitle || "Pricing";
  const pricingDescription = config.pricingDescription || "Straightforward plans, scaled by scan quota and team size.";

  const faqTitle = config.faqTitle || "Frequently asked questions";

  const ctaTitle = config.ctaTitle || "Ready to verify before you scan?";
  const ctaDescription = config.ctaDescription || `Create an organization on ${config.platformName} and add your first asset in a couple of minutes.`;

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader platformName={config.platformName} />
      <main className="flex-1">
        <LandingHero badgeText={heroBadgeText} heroTitle={heroTitle} heroDescription={heroDescription} />
        <LandingHowItWorks title={howItWorksTitle} description={howItWorksDescription} steps={landingContent.howItWorks} />
        <LandingFeatures title={featuresSectionTitle} description={featuresSectionDescription} features={landingContent.features} />
        <LandingSecurity title={securityTitle} description={securityDescription} points={landingContent.security} />
        <LandingPricing title={pricingTitle} description={pricingDescription} plans={plans} />
        <LandingFaq title={faqTitle} faq={landingContent.faq} />
        <LandingCta title={ctaTitle} description={ctaDescription} />
      </main>
      <LandingFooter config={config} />
    </div>
  );
}
