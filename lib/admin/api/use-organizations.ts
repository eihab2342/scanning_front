"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import {
  AdminOrganizationDetail,
  AdminOrganizationListView,
  EffectiveLimits,
  ImpersonateInput,
  ImpersonationResponse,
  ListOrganizationsParams,
  SubscriptionOverride,
  SuspendOrganizationInput,
  UpdateOrganizationSubscriptionInput,
  UpsertSubscriptionOverrideInput,
} from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminHealthKey } from "./query-keys";
import { adminOrganizationKeys } from "./query-keys";

function buildQueryString(params: ListOrganizationsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminOrganizations(params: ListOrganizationsParams = {}) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminOrganizationKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => adminApiFetch<AdminOrganizationListView>(`/admin/organizations${buildQueryString(params)}`),
    enabled: Boolean(accessToken),
  });
}

export function useAdminOrganization(id: string | undefined) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminOrganizationKeys.detail(id ?? ""),
    queryFn: () => adminApiFetch<AdminOrganizationDetail>(`/admin/organizations/${id}`),
    enabled: Boolean(accessToken) && Boolean(id),
  });
}

export function useAdminOrganizationEffectiveLimits(id: string | undefined) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminOrganizationKeys.effectiveLimits(id ?? ""),
    queryFn: () => adminApiFetch<EffectiveLimits>(`/admin/organizations/${id}/subscription/effective-limits`),
    enabled: Boolean(accessToken) && Boolean(id),
  });
}

export function useAdminOrganizationOverrides(id: string | undefined) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminOrganizationKeys.overrides(id ?? ""),
    queryFn: () => adminApiFetch<SubscriptionOverride[]>(`/admin/organizations/${id}/subscription/overrides`),
    enabled: Boolean(accessToken) && Boolean(id),
  });
}

export function useSuspendOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SuspendOrganizationInput) =>
      adminApiFetch<AdminOrganizationDetail>(`/admin/organizations/${id}/suspend`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.all });
      queryClient.invalidateQueries({ queryKey: adminHealthKey });
    },
  });
}

export function useUnsuspendOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApiFetch<AdminOrganizationDetail>(`/admin/organizations/${id}/unsuspend`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.all });
      queryClient.invalidateQueries({ queryKey: adminHealthKey });
    },
  });
}

export function useUpdateOrganizationSubscription(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOrganizationSubscriptionInput) =>
      adminApiFetch(`/admin/organizations/${id}/subscription`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.effectiveLimits(id) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.all });
    },
  });
}

export function useUpsertSubscriptionOverride(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, dto }: { key: string; dto: UpsertSubscriptionOverrideInput }) =>
      adminApiFetch<SubscriptionOverride>(`/admin/organizations/${organizationId}/subscription/overrides/${key}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.overrides(organizationId) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.effectiveLimits(organizationId) });
    },
  });
}

export function useRemoveSubscriptionOverride(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) =>
      adminApiFetch(`/admin/organizations/${organizationId}/subscription/overrides/${key}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.overrides(organizationId) });
      queryClient.invalidateQueries({ queryKey: adminOrganizationKeys.effectiveLimits(organizationId) });
    },
  });
}

export function useImpersonateOrganization(organizationId: string) {
  return useMutation({
    mutationFn: (dto: ImpersonateInput) =>
      adminApiFetch<ImpersonationResponse>(`/admin/organizations/${organizationId}/impersonate`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
  });
}
