// Mirrors the backend's unauthenticated surface exactly (src/public/**,
// src/platform-settings/**) — never invented client-side. Reachable with no
// Authorization header, so every field here is already safe for an
// anonymous visitor by construction (see PlatformSettingsService's
// PublicPlatformConfig and toPublicPlanView).

export interface PublicPlatformConfig {
  platformName: string;
  logoUrl: string | null;
  supportEmail: string | null;
  supportUrl: string | null;
  contactUrl: string | null;
  heroBadgeText: string | null;
  heroTitle: string | null;
  heroDescription: string | null;
  howItWorksTitle: string | null;
  howItWorksDescription: string | null;
  featuresSectionTitle: string | null;
  featuresSectionDescription: string | null;
  securityTitle: string | null;
  securityDescription: string | null;
  pricingTitle: string | null;
  pricingDescription: string | null;
  faqTitle: string | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  footerText: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
}

export interface PublicPlanFeature {
  key: string;
  name: string;
  description: string | null;
  type: "BOOLEAN" | "QUANTITY";
  value: boolean | number;
  unit: string | null;
}

export interface PublicLandingFeature {
  title: string;
  description: string;
  icon: string | null;
}

export interface PublicLandingFaqItem {
  question: string;
  answerHtml: string;
}

export interface PublicLandingContent {
  features: PublicLandingFeature[];
  howItWorks: PublicLandingFeature[];
  security: PublicLandingFeature[];
  faq: PublicLandingFaqItem[];
}

export interface PublicCmsPage {
  slug: string;
  title: string;
  contentHtml: string;
  updatedAt: string;
}

export interface PublicPlan {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  currency: string;
  billingMonthlyEnabled: boolean;
  billingYearlyEnabled: boolean;
  scanQuota: number;
  assetLimit: number | null;
  teamMemberLimit: number | null;
  isFeatured: boolean;
  sortOrder: number;
  ctaLabel: string | null;
  trialAvailable: boolean;
  trialDays: number;
  features: PublicPlanFeature[];
}
