/**
 * Centralized query keys — this module is the first to need more than one
 * key/mutation (see useDashboardOverview's single flat-array key), so it
 * establishes the factory convention the rest of the app should follow.
 */
export const assetKeys = {
  all: ["assets"] as const,
  list: () => [...assetKeys.all, "list"] as const,
  detail: (id: string) => [...assetKeys.all, "detail", id] as const,
};

export const dashboardOverviewKey = ["dashboard-overview"] as const;

export const scanKeys = {
  all: ["scans"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...scanKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...scanKeys.all, "detail", id] as const,
};

export const reportKeys = {
  all: ["reports"] as const,
  list: () => [...reportKeys.all, "list"] as const,
  detail: (id: string) => [...reportKeys.all, "detail", id] as const,
};

export const teamKeys = {
  all: ["team"] as const,
  list: () => [...teamKeys.all, "list"] as const,
};

export const activityKeys = {
  all: ["activity"] as const,
  list: (params?: Record<string, string | number | undefined>) => [...activityKeys.all, "list", params ?? {}] as const,
};

export const organizationKeys = {
  all: ["organization"] as const,
  me: () => [...organizationKeys.all, "me"] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export const billingKeys = {
  all: ["billing"] as const,
  subscription: () => [...billingKeys.all, "subscription"] as const,
  entitlements: () => [...billingKeys.all, "entitlements"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
};

export const cashPaymentKeys = {
  all: ["cash-payments"] as const,
  list: () => [...cashPaymentKeys.all, "list"] as const,
};

export const kashierCheckoutKeys = {
  all: ["kashier-checkouts"] as const,
  list: () => [...kashierCheckoutKeys.all, "list"] as const,
  detail: (id: string) => [...kashierCheckoutKeys.all, "detail", id] as const,
};

export const permissionsKeys = {
  all: ["permissions"] as const,
  me: () => [...permissionsKeys.all, "me"] as const,
  member: (userId: string) => [...permissionsKeys.all, "member", userId] as const,
};
