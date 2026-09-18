// Mirrors the backend's real enums/DTOs (src/dashboard/dto/dashboard-overview.view.ts and
// src/common/decorators/current-user.decorator.ts) exactly — never invented client-side.
// Dates arrive as ISO strings over JSON, not Date instances.

export type Role = "owner" | "admin" | "member" | "viewer";

// Mirrors src/permissions/permission-catalog.ts's PERMISSIONS exactly —
// never invented client-side. The backend is authoritative; this list only
// drives which capability keys the UI knows how to render/gate.
export const PERMISSIONS = [
  "dashboard.view",

  "assets.view",
  "assets.create",
  "assets.verify",
  "assets.revoke",

  "scans.view",
  "scans.create",

  "reports.view",
  "reports.download",
  "reports.create",

  "activity.view",
  "activity.view_security",
  "activity.view_assets",
  "activity.view_scans",
  "activity.view_reports",
  "activity.view_team",
  "activity.view_billing",

  "team.view",
  "team.invite",
  "team.change_role",
  "team.deactivate",
  "team.reactivate",
  "team.manage_access",

  "organization.view",
  "organization.update",

  "billing.view",
  "billing.checkout",
  "billing.portal",
  "billing.change_plan",
  "billing.cancel",
  "billing.reactivate",

  "usage.view",

  "profile.view",
  "profile.change_password",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type OverrideEffect = "allow" | "deny";

export interface EffectivePermissionsResponse {
  role: Role;
  permissions: Permission[];
}

export interface MemberPermissionsView {
  userId: string;
  role: Role;
  roleDefaults: Permission[];
  overrides: Array<{ permission: Permission; effect: OverrideEffect }>;
  effectivePermissions: Permission[];
}

export interface PermissionOverrideChangeInput {
  permission: Permission;
  /** null resets that one permission back to its role default. */
  effect: OverrideEffect | null;
}

export interface UpdateMemberPermissionsInput {
  changes: PermissionOverrideChangeInput[];
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
export type BillingInterval = "monthly" | "yearly";
export type OwnershipStatus = "pending" | "verified" | "revoked";
export type ScanStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type AssetType = "domain" | "ip";
export type VerificationMethod = "dns_txt" | "http_file";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: Role;
  email?: string;
  iat: number;
  exp: number;
}

export interface DashboardOverviewView {
  organization: {
    id: string;
    name: string;
    slug: string;
    isSuspended: boolean;
    suspendedReason: string | null;
  };
  subscription: {
    status: SubscriptionStatus;
    billingInterval: BillingInterval;
    planName: string;
    planSlug: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    cancelledAt: string | null;
    trialEndsAt: string | null;
    usagePeriodStart: string;
    usagePeriodEnd: string;
  };
  usage: {
    scans: { limit: number; used: number; remaining: number };
    assets: { limit: number | null; total: number; verified: number; pending: number; revoked: number };
    teamMembers: { limit: number | null; used: number };
  };
  assets: {
    recent: Array<{
      id: string;
      value: string;
      ownershipStatus: OwnershipStatus;
      createdAt: string;
    }>;
  };
  scans: {
    recent: Array<{
      id: string;
      assetValue: string;
      status: ScanStatus;
      createdAt: string;
      completedAt: string | null;
      reportId: string | null;
    }>;
  };
  attention: Array<{
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    message: string;
  }>;
  recentActivity: Array<{
    action: string;
    label: string;
    createdAt: string;
  }>;
}

// Mirrors src/assets/dto/asset.view.ts exactly.

export interface DnsTxtChallenge {
  method: "dns_txt";
  recordType: "TXT";
  host: string;
  value: string;
}

export interface HttpFileChallenge {
  method: "http_file";
  url: string;
  path: string;
  content: string;
}

export type VerificationChallenge = DnsTxtChallenge | HttpFileChallenge;

export interface Asset {
  id: string;
  hostname: string;
  type: AssetType;
  ownershipStatus: OwnershipStatus;
  verificationMethod: VerificationMethod;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  /** > 0 only after an automatic reverification recheck failed — see AssetView's backend doc comment. */
  consecutiveFailedChecks: number;
  challenge: VerificationChallenge;
}

export interface CreateAssetInput {
  type: "domain";
  value: string;
  verificationMethod: VerificationMethod;
}

export interface AssetWithInstructions {
  asset: Asset;
  verificationInstructions: string;
}

export interface VerifyAssetResult extends AssetWithInstructions {
  checkDetail: string;
}

// Mirrors src/scans/dto/scan.view.ts exactly.
export interface Scan {
  id: string;
  status: ScanStatus;
  asset: { id: string; hostname: string };
  createdAt: string;
  completedAt: string | null;
  hasReport: boolean;
  reportId: string | null;
  failureSummary: string | null;
}

export interface ScanListView {
  items: Scan[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface CreateScanInput {
  assetId: string;
}

export const NON_TERMINAL_SCAN_STATUSES: ScanStatus[] = ["queued", "running"];

// Mirrors src/reports/dto/report.view.ts exactly.
export interface Report {
  id: string;
  scanId: string;
  asset: { id: string; hostname: string };
  scanStatus: ScanStatus;
  createdAt: string;
}

// Mirrors src/users/dto/safe-user.view.ts exactly — used both for team rows and the current user's own profile.
export interface SafeUserView {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export type TeamMember = SafeUserView;

export interface InviteMemberInput {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateMemberRoleInput {
  role: Role;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Mirrors src/organizations/dto/organization.view.ts exactly.
export interface OrganizationView {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  isSuspended: boolean;
  suspendedReason: string | null;
}

export interface UpdateOrganizationInput {
  name: string;
}

// Mirrors src/subscriptions/dto/public-plan.view.ts exactly.
export interface PublicPlanFeatureView {
  key: string;
  name: string;
  description: string | null;
  type: "BOOLEAN" | "QUANTITY";
  value: boolean | number;
  unit: string | null;
}

export interface PublicPlanView {
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
  features: PublicPlanFeatureView[];
}

// Mirrors src/subscriptions/dto/public-subscription.view.ts exactly.
export interface SubscriptionView {
  id: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  scanQuota: number;
  scansUsed: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usagePeriodStart: string;
  usagePeriodEnd: string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  hasBillingAccount: boolean;
  plan: PublicPlanView;
}

// Mirrors src/subscriptions/dto/entitlements.view.ts exactly.
export interface ResolvedEntitlements {
  plan: { id: string; name: string; slug: string };
  limits: {
    scans: { limit: number; used: number; remaining: number };
    assets: { limit: number | null };
    teamMembers: { limit: number | null };
  };
  features: Record<string, boolean | number>;
}

export interface CreateCheckoutSessionInput {
  planId: string;
  billingInterval: BillingInterval;
}

export interface ChangeBillingPlanInput {
  planId: string;
  billingInterval: BillingInterval;
}

// Mirrors CashPaymentRequest (src/billing/cash-payments.service.ts's tenant
// view) — the "cash gateway": a manual alternative to Stripe checkout for an
// organization's first paid plan, reviewed by a platform admin.
export type CashPaymentStatus = "pending" | "approved" | "rejected";

export interface CashPaymentRequestView {
  id: string;
  planId: string;
  plan: { id: string; name: string };
  billingInterval: BillingInterval;
  amountCents: number;
  currency: string;
  status: CashPaymentStatus;
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface CreateCashPaymentInput {
  planId: string;
  billingInterval: BillingInterval;
  note?: string;
}

// Mirrors KashierCheckoutSession (src/billing/kashier-checkout.service.ts) —
// a real online payment via Kashier (developers.kashier.io), the third "how
// do I pay" option alongside Stripe checkout and the cash gateway.
export type KashierCheckoutStatus = "pending" | "paid" | "failed";

export interface KashierCheckoutSessionView {
  id: string;
  planId: string;
  plan: { id: string; name: string };
  billingInterval: BillingInterval;
  amountCents: number;
  currency: string;
  status: KashierCheckoutStatus;
  createdAt: string;
}

export interface CreateKashierCheckoutInput {
  planId: string;
  billingInterval: BillingInterval;
}

// Mirrors src/audit/audit-actions.ts exactly.
export type ActivityCategory = "security" | "assets" | "scans" | "reports" | "team" | "billing";

// Mirrors src/audit/dto/audit-log.view.ts exactly.
export interface AuditLogEntry {
  id: string;
  action: string;
  occurredAt: string;
  actor: { email: string } | null;
}

export interface AuditLogListView {
  items: AuditLogEntry[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
