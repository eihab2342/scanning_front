import {
  Asset,
  AuditLogEntry,
  AuditLogListView,
  DashboardOverviewView,
  OrganizationView,
  PublicPlanView,
  Report,
  SafeUserView,
  Scan,
  ScanListView,
  SubscriptionView,
  TeamMember,
} from "@/lib/api/types";

export function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset-1",
    hostname: "example.com",
    type: "domain",
    ownershipStatus: "pending",
    verificationMethod: "dns_txt",
    verifiedAt: null,
    lastCheckedAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    consecutiveFailedChecks: 0,
    challenge: { method: "dns_txt", recordType: "TXT", host: "example.com", value: "future-verify=abc-123-def" },
    ...overrides,
  };
}

export function makeHttpAsset(overrides: Partial<Asset> = {}): Asset {
  return makeAsset({
    verificationMethod: "http_file",
    challenge: {
      method: "http_file",
      url: "https://example.com/.well-known/future-verify-abc-123-def.txt",
      path: "/.well-known/future-verify-abc-123-def.txt",
      content: "abc-123-def",
    },
    ...overrides,
  });
}

export function makeScan(overrides: Partial<Scan> = {}): Scan {
  return {
    id: "scan-1",
    status: "queued",
    asset: { id: "asset-1", hostname: "example.com" },
    createdAt: "2026-09-01T00:00:00.000Z",
    completedAt: null,
    hasReport: false,
    reportId: null,
    failureSummary: null,
    ...overrides,
  };
}

export function makeScanList(items: Scan[], overrides: Partial<ScanListView["pagination"]> = {}): ScanListView {
  return {
    items,
    pagination: { page: 1, pageSize: 20, total: items.length, totalPages: 1, ...overrides },
  };
}

export function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: "report-1",
    scanId: "scan-1",
    asset: { id: "asset-1", hostname: "example.com" },
    scanStatus: "completed",
    createdAt: "2026-09-01T01:00:00.000Z",
    ...overrides,
  };
}

export function makeTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: "user-1",
    email: "owner@example.com",
    role: "owner",
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeSafeUser(overrides: Partial<SafeUserView> = {}): SafeUserView {
  return makeTeamMember(overrides);
}

export function makeOrganization(overrides: Partial<OrganizationView> = {}): OrganizationView {
  return {
    id: "org-1",
    name: "Acme Inc",
    slug: "acme-inc",
    createdAt: "2026-09-01T00:00:00.000Z",
    isSuspended: false,
    suspendedReason: null,
    ...overrides,
  };
}

export function makeAuditLogEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: "audit-1",
    action: "asset.created",
    occurredAt: "2026-09-01T00:00:00.000Z",
    actor: { email: "owner@example.com" },
    ...overrides,
  };
}

export function makeAuditLogList(items: AuditLogEntry[], overrides: Partial<AuditLogListView["pagination"]> = {}): AuditLogListView {
  return {
    items,
    pagination: { page: 1, pageSize: 20, total: items.length, totalPages: 1, ...overrides },
  };
}

export function makePlan(overrides: Partial<PublicPlanView> = {}): PublicPlanView {
  return {
    id: "plan-1",
    name: "Pro",
    slug: "pro",
    shortDescription: "For growing teams.",
    monthlyPriceCents: 4900,
    yearlyPriceCents: 49000,
    currency: "usd",
    billingMonthlyEnabled: true,
    billingYearlyEnabled: true,
    scanQuota: 100,
    assetLimit: 20,
    teamMemberLimit: 10,
    isFeatured: false,
    sortOrder: 0,
    ctaLabel: null,
    trialAvailable: false,
    trialDays: 0,
    features: [],
    ...overrides,
  };
}

export function makeSubscription(overrides: Partial<SubscriptionView> = {}): SubscriptionView {
  return {
    id: "sub-1",
    status: "active",
    billingInterval: "monthly",
    scanQuota: 100,
    scansUsed: 10,
    currentPeriodStart: "2026-09-01T00:00:00.000Z",
    currentPeriodEnd: "2026-10-01T00:00:00.000Z",
    usagePeriodStart: "2026-09-01T00:00:00.000Z",
    usagePeriodEnd: "2026-10-01T00:00:00.000Z",
    trialStartsAt: null,
    trialEndsAt: null,
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    hasBillingAccount: false,
    plan: makePlan(),
    ...overrides,
  };
}

export function makeOverview(overrides: Partial<DashboardOverviewView> = {}): DashboardOverviewView {
  return {
    organization: { id: "org-1", name: "Acme Inc", slug: "acme-inc", isSuspended: false, suspendedReason: null },
    subscription: {
      status: "active",
      billingInterval: "monthly",
      planName: "Pro",
      planSlug: "pro",
      currentPeriodEnd: "2026-10-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      trialEndsAt: null,
      usagePeriodStart: "2026-09-01T00:00:00.000Z",
      usagePeriodEnd: "2026-10-01T00:00:00.000Z",
    },
    usage: {
      scans: { limit: 100, used: 10, remaining: 90 },
      assets: { limit: 20, total: 1, verified: 0, pending: 1, revoked: 0 },
      teamMembers: { limit: 5, used: 1 },
    },
    assets: { recent: [] },
    scans: { recent: [] },
    attention: [],
    recentActivity: [],
    ...overrides,
  };
}
