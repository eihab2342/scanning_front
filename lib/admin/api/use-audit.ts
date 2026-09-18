"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { AdminAuditListView, DeniedScanEntry, ListAuditParams } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminAuditKeys } from "./query-keys";

function buildQueryString(params: ListAuditParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminAuditLog(params: ListAuditParams = {}) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminAuditKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => adminApiFetch<AdminAuditListView>(`/admin/audit-logs${buildQueryString(params)}`),
    enabled: Boolean(accessToken),
  });
}

export function useDeniedScans(limit = 20) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminAuditKeys.denied({ limit }),
    queryFn: () => adminApiFetch<DeniedScanEntry[]>(`/admin/audit-logs/denied?limit=${limit}`),
    enabled: Boolean(accessToken),
  });
}
