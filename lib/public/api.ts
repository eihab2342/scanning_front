import { PublicCmsPage, PublicLandingContent, PublicPlan, PublicPlatformConfig } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

const DEFAULT_CONFIG: PublicPlatformConfig = {
  platformName: "FutureVerify",
  logoUrl: null,
  supportEmail: null,
  supportUrl: null,
  contactUrl: null,
  heroBadgeText: null,
  heroTitle: null,
  heroDescription: null,
  howItWorksTitle: null,
  howItWorksDescription: null,
  featuresSectionTitle: null,
  featuresSectionDescription: null,
  securityTitle: null,
  securityDescription: null,
  pricingTitle: null,
  pricingDescription: null,
  faqTitle: null,
  ctaTitle: null,
  ctaDescription: null,
  seoTitle: null,
  seoDescription: null,
  footerText: null,
  termsUrl: null,
  privacyUrl: null,
};

/**
 * Server-side fetches for the public landing page (app/page.tsx) — no
 * Authorization header, same as a browser fetching the same unauthenticated
 * endpoints. `cache: "no-store"` on purpose: an admin's /admin/settings save
 * must show up on the next page load, not after a stale build/ISR window
 * (see the phase brief's "changes should appear without code changes").
 * Both fail soft to a safe default rather than throwing, so a backend
 * hiccup degrades the landing page instead of taking it down.
 */
export async function getPublicConfig(): Promise<PublicPlatformConfig> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/config`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONFIG;
    return (await res.json()) as PublicPlatformConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function getPublicPlans(): Promise<PublicPlan[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as PublicPlan[];
  } catch {
    return [];
  }
}

const EMPTY_LANDING_CONTENT: PublicLandingContent = { features: [], howItWorks: [], security: [], faq: [] };

export async function getPublicLandingContent(): Promise<PublicLandingContent> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/landing-content`, { cache: "no-store" });
    if (!res.ok) return EMPTY_LANDING_CONTENT;
    return (await res.json()) as PublicLandingContent;
  } catch {
    return EMPTY_LANDING_CONTENT;
  }
}

/** Returns null for a 404 (unknown/unpublished slug) — callers should render Next's notFound() in that case. */
export async function getPublicPage(slug: string): Promise<PublicCmsPage | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/pages/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicCmsPage;
  } catch {
    return null;
  }
}
