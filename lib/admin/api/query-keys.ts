export const adminHealthKey = ["admin", "health"] as const;

export const adminOrganizationKeys = {
  all: ["admin", "organizations"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...adminOrganizationKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...adminOrganizationKeys.all, "detail", id] as const,
  overrides: (id: string) => [...adminOrganizationKeys.all, "overrides", id] as const,
  effectiveLimits: (id: string) => [...adminOrganizationKeys.all, "effective-limits", id] as const,
  billingEvents: (id: string) => [...adminOrganizationKeys.all, "billing-events", id] as const,
};

export const adminPlanKeys = {
  all: ["admin", "plans"] as const,
  list: () => [...adminPlanKeys.all, "list"] as const,
  features: (planId: string) => [...adminPlanKeys.all, "features", planId] as const,
};

export const adminFeatureKeys = {
  all: ["admin", "features"] as const,
  list: () => [...adminFeatureKeys.all, "list"] as const,
};

export const adminAuditKeys = {
  all: ["admin", "audit"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...adminAuditKeys.all, "list", params ?? {}] as const,
  denied: (params?: Record<string, string | number | undefined>) => [...adminAuditKeys.all, "denied", params ?? {}] as const,
};

export const adminBillingEventKeys = {
  all: ["admin", "billing-events"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...adminBillingEventKeys.all, "list", params ?? {}] as const,
};

export const adminSettingsKey = ["admin", "settings"] as const;

export const adminCmsPageKeys = {
  all: ["admin", "cms-pages"] as const,
  list: () => [...adminCmsPageKeys.all, "list"] as const,
};

export const adminLandingFeatureKeys = {
  all: ["admin", "landing-features"] as const,
  list: () => [...adminLandingFeatureKeys.all, "list"] as const,
};

export const adminLandingFaqKeys = {
  all: ["admin", "landing-faq"] as const,
  list: () => [...adminLandingFaqKeys.all, "list"] as const,
};

export const adminCashPaymentKeys = {
  all: ["admin", "cash-payments"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...adminCashPaymentKeys.all, "list", params ?? {}] as const,
};
