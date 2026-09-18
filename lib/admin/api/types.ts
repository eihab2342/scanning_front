// Mirrors the backend's platform-admin surface (src/admin/**) exactly —
// never invented client-side. This is a structurally separate identity
// system from the tenant one (lib/api/types.ts): PlatformAdminRole is not a
// tenant Role, and none of these shapes are ever returned to a tenant user.

export type PlatformAdminRole = "super_admin" | "support" | "billing_ops";

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: PlatformAdminRole;
  type: "platform_admin";
  iat: number;
  exp: number;
}

export interface AdminAuthTokens {
  accessToken: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
export type BillingInterval = "monthly" | "yearly";

// Mirrors src/admin/platform-health.service.ts's PlatformHealth exactly.
export interface PlatformHealth {
  organizations: { total: number; suspended: number };
  subscriptions: Record<SubscriptionStatus, number>;
  scans: Record<string, number>;
  queue: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  plans: { total: number; active: number };
}

// Raw Prisma Plan row (admin surface) — NOT the sanitized tenant-facing
// PublicPlanView (lib/api/types.ts), which omits Stripe IDs/isActive/legacy fields.
export interface AdminPlan {
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
  isPublic: boolean;
  isActive: boolean;
  ctaLabel: string | null;
  trialAvailable: boolean;
  trialDays: number;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  priceCents: number;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  shortDescription?: string;
  monthlyPriceCents?: number;
  yearlyPriceCents?: number;
  currency?: string;
  billingMonthlyEnabled?: boolean;
  billingYearlyEnabled?: boolean;
  scanQuota: number;
  assetLimit?: number;
  teamMemberLimit?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
  ctaLabel?: string;
  trialAvailable?: boolean;
  trialDays?: number;
  stripeProductId?: string;
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export type FeatureType = "BOOLEAN" | "QUANTITY";

// Mirrors the raw Prisma Feature row.
export interface AdminFeature {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: FeatureType;
  unit: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureInput {
  key: string;
  name: string;
  description?: string;
  type: FeatureType;
  unit?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// key/type are immutable after creation — see UpdateFeatureDto's comment.
export interface UpdateFeatureInput {
  name?: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Mirrors PlanFeaturesService.PlanFeatureWithKey (PlanFeature & { feature: Feature }).
export interface AdminPlanFeature {
  id: string;
  planId: string;
  featureId: string;
  boolValue: boolean | null;
  limitValue: number | null;
  createdAt: string;
  updatedAt: string;
  feature: AdminFeature;
}

export interface AssignPlanFeatureInput {
  boolValue?: boolean;
  limitValue?: number;
}

export type SubscriptionOverrideKey = "scan_quota" | "asset_limit" | "team_member_limit";

// Mirrors the raw Prisma SubscriptionOverride row.
export interface SubscriptionOverride {
  id: string;
  subscriptionId: string;
  organizationId: string;
  key: SubscriptionOverrideKey;
  value: number;
  reason: string | null;
  expiresAt: string | null;
  createdByPlatformAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSubscriptionOverrideInput {
  value: number;
  reason?: string;
  expiresAt?: string;
}

// Mirrors src/subscriptions/dto/entitlements.view.ts's ResolvedEntitlements shape.
export interface EffectiveLimits {
  plan: { id: string; name: string; slug: string };
  limits: {
    scans: { limit: number; used: number; remaining: number };
    assets: { limit: number | null };
    teamMembers: { limit: number | null };
  };
  features: Record<string, boolean | number>;
}

// Raw Prisma Subscription row, always returned nested with its Plan.
export interface AdminSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  scanQuota: number;
  scansUsed: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usageAnchorAt: string;
  usagePeriodStart: string;
  usagePeriodEnd: string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: AdminPlan;
}

export interface UpdateOrganizationSubscriptionInput {
  planId?: string;
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval;
  scanQuota?: number;
  scansUsed?: number;
}

export interface AdminOrganizationListItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
  subscription: AdminSubscription | null;
  _count: { users: number; assets: number; scans: number };
}

export interface AdminOrganizationListView {
  items: AdminOrganizationListItem[];
  pagination: Pagination;
}

export interface AdminOrganizationMember {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminOrganizationDetail {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
  subscription: AdminSubscription | null;
  users: AdminOrganizationMember[];
  _count: { assets: number; scans: number };
}

export interface ListOrganizationsParams {
  search?: string;
  status?: SubscriptionStatus | "suspended";
  page?: number;
  pageSize?: number;
}

export interface SuspendOrganizationInput {
  reason: string;
}

export interface ImpersonateInput {
  reason: string;
}

export interface ImpersonationResponse {
  accessToken: string;
  expiresInSeconds: number;
  organization: { id: string; name: string };
  actingAs: { userId: string; email: string; role: string };
}

// Mirrors AdminAuditService.list's return shape.
export interface AdminAuditLogEntry {
  id: string;
  organizationId: string | null;
  platformAdminId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  organization: { id: string; name: string; slug: string } | null;
  platformAdmin: { id: string; email: string; role: PlatformAdminRole } | null;
}

export interface AdminAuditListView {
  items: AdminAuditLogEntry[];
  pagination: Pagination;
}

export interface ListAuditParams {
  organizationId?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}

export interface DeniedScanEntry {
  id: string;
  organizationId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  organization: { id: string; name: string; slug: string } | null;
}

export type BillingEventStatus = "received" | "processed" | "failed";

// Mirrors the raw Prisma BillingEvent row — no raw Stripe payload is ever
// stored on this model (see its schema comment), so there is nothing to redact.
export interface AdminBillingEvent {
  id: string;
  provider: string;
  externalEventId: string;
  eventType: string;
  status: BillingEventStatus;
  organizationId: string | null;
  subscriptionId: string | null;
  receivedAt: string;
  processedAt: string | null;
  failureReason: string | null;
  organization: { id: string; name: string; slug: string } | null;
}

export interface AdminBillingEventListView {
  items: AdminBillingEvent[];
  pagination: Pagination;
}

export interface ListBillingEventsParams {
  organizationId?: string;
  status?: BillingEventStatus;
  page?: number;
  pageSize?: number;
}

// Mirrors the PlatformSettings row (src/platform-settings) exactly —
// the single, admin-editable source for the public landing page's
// brand/hero/SEO/legal copy (see GET /public/config, the sanitized subset a
// visitor actually receives).
export interface AdminPlatformSettings {
  id: string;
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
  kashierEnabled: boolean;
  kashierMode: string;
  kashierMerchantId: string | null;
  kashierApiKey: string | null;
  kashierSecretKeySet: boolean;
  updatedAt: string;
}

export type UpdatePlatformSettingsInput = Partial<
  Omit<AdminPlatformSettings, "id" | "updatedAt" | "kashierSecretKeySet"> & { kashierSecretKey: string }
>;

// Mirrors CmsPage (src/cms) — the fixed terms/privacy/about catalog.
export interface AdminCmsPage {
  id: string;
  slug: string;
  title: string;
  contentMarkdown: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface UpdateCmsPageInput {
  title?: string;
  contentMarkdown?: string;
  isPublished?: boolean;
}

// Mirrors LandingFeatureItem/LandingFaqItem (src/cms) — the landing page's
// three icon-card grids (Core features / How it works / Security) share this
// one shape, distinguished by `section` (see landing-sections.constants.ts),
// plus the FAQ accordion content.
export type LandingSection = "features" | "how_it_works" | "security";

export interface AdminLandingFeature {
  id: string;
  section: LandingSection;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingFeatureInput {
  section: LandingSection;
  title: string;
  description: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateLandingFeatureInput = Partial<CreateLandingFeatureInput>;

export interface AdminLandingFaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingFaqInput {
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateLandingFaqInput = Partial<CreateLandingFaqInput>;

// Mirrors CashPaymentRequest (src/admin/admin-cash-payments.service.ts) —
// the "cash gateway" admin review queue.
export interface AdminCashPaymentRequest {
  id: string;
  organizationId: string;
  organization: { id: string; name: string; slug: string };
  plan: { id: string; name: string };
  billingInterval: BillingInterval;
  amountCents: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AdminCashPaymentListView {
  items: AdminCashPaymentRequest[];
  pagination: Pagination;
}

export interface ListCashPaymentsParams {
  status?: "pending" | "approved" | "rejected";
  organizationId?: string;
  page?: number;
  pageSize?: number;
}
