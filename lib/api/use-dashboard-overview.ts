"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { DashboardOverviewView } from "./types";
import { useAuth } from "../auth/auth-context";
import { dashboardOverviewKey } from "./query-keys";

/**
 * The single call that backs the entire authenticated shell: sidebar org/plan
 * chip, the restriction banner, and the Overview page all read from this one
 * cached query instead of issuing their own requests (see the backend
 * aggregation note in dashboard.module.ts).
 */
export function useDashboardOverview() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: dashboardOverviewKey,
    queryFn: () => apiFetch<DashboardOverviewView>("/dashboard/overview"),
    enabled: Boolean(accessToken),
  });
}
