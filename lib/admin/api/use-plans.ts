"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import {
  AdminPlan,
  AdminPlanFeature,
  AssignPlanFeatureInput,
  CreatePlanInput,
  UpdatePlanInput,
} from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminPlanKeys } from "./query-keys";

export function useAdminPlans() {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminPlanKeys.list(),
    queryFn: () => adminApiFetch<AdminPlan[]>("/admin/plans"),
    enabled: Boolean(accessToken),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePlanInput) => adminApiFetch<AdminPlan>("/admin/plans", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.list() }),
  });
}

export function useUpdatePlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePlanInput) => adminApiFetch<AdminPlan>(`/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.list() }),
  });
}

export function useArchivePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiFetch<AdminPlan>(`/admin/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.list() }),
  });
}

export function usePlanFeatures(planId: string | undefined) {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminPlanKeys.features(planId ?? ""),
    queryFn: () => adminApiFetch<AdminPlanFeature[]>(`/admin/plans/${planId}/features`),
    enabled: Boolean(accessToken) && Boolean(planId),
  });
}

export function useAssignPlanFeature(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ featureId, dto }: { featureId: string; dto: AssignPlanFeatureInput }) =>
      adminApiFetch<AdminPlanFeature>(`/admin/plans/${planId}/features/${featureId}`, { method: "PUT", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.features(planId) }),
  });
}

export function useRemovePlanFeature(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureId: string) => adminApiFetch(`/admin/plans/${planId}/features/${featureId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.features(planId) }),
  });
}
