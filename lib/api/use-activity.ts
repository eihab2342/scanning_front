"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { ActivityCategory, AuditLogListView } from "./types";
import { useAuth } from "../auth/auth-context";
import { activityKeys } from "./query-keys";

export interface ActivityListParams {
  page?: number;
  pageSize?: number;
  category?: ActivityCategory;
}

function buildActivityQueryString(params: ActivityListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.category) search.set("category", params.category);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useActivity(params: ActivityListParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: activityKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => apiFetch<AuditLogListView>(`/audit-logs${buildActivityQueryString(params)}`),
    enabled: Boolean(accessToken),
  });
}
