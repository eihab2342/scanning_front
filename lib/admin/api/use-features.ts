"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { AdminFeature, CreateFeatureInput, UpdateFeatureInput } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminFeatureKeys, adminPlanKeys } from "./query-keys";

export function useAdminFeatures() {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminFeatureKeys.list(),
    queryFn: () => adminApiFetch<AdminFeature[]>("/admin/features"),
    enabled: Boolean(accessToken),
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeatureInput) => adminApiFetch<AdminFeature>("/admin/features", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminFeatureKeys.list() }),
  });
}

export function useUpdateFeature(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateFeatureInput) =>
      adminApiFetch<AdminFeature>(`/admin/features/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFeatureKeys.list() });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}

export function useArchiveFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiFetch<AdminFeature>(`/admin/features/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFeatureKeys.list() });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
    },
  });
}
