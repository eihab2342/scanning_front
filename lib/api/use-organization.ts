"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { OrganizationView, UpdateOrganizationInput } from "./types";
import { useAuth } from "../auth/auth-context";
import { organizationKeys, dashboardOverviewKey } from "./query-keys";

export function useOrganization() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: organizationKeys.me(),
    queryFn: () => apiFetch<OrganizationView>("/organizations/me"),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateOrganizationInput) => apiFetch<OrganizationView>("/organizations/me", { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: (organization) => {
      queryClient.setQueryData(organizationKeys.me(), organization);
      // The sidebar/header read the org name from the dashboard overview query, not this one — invalidate it too so they update immediately.
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
    },
  });
}
