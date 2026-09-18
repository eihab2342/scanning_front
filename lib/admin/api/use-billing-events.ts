"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { AdminBillingEventListView, ListBillingEventsParams } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminBillingEventKeys } from "./query-keys";

function buildQueryString(params: ListBillingEventsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminBillingEvents(params: ListBillingEventsParams = {}) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminBillingEventKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => adminApiFetch<AdminBillingEventListView>(`/admin/billing-events${buildQueryString(params)}`),
    enabled: Boolean(accessToken),
  });
}
