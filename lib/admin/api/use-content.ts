"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import {
  AdminCmsPage,
  AdminLandingFaqItem,
  AdminLandingFeature,
  CreateLandingFaqInput,
  CreateLandingFeatureInput,
  UpdateCmsPageInput,
  UpdateLandingFaqInput,
  UpdateLandingFeatureInput,
} from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminCmsPageKeys, adminLandingFaqKeys, adminLandingFeatureKeys } from "./query-keys";

export function useAdminCmsPages() {
  const { accessToken } = useAdminAuth();
  return useQuery({
    queryKey: adminCmsPageKeys.list(),
    queryFn: () => adminApiFetch<AdminCmsPage[]>("/admin/cms-pages"),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateCmsPage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCmsPageInput) => adminApiFetch<AdminCmsPage>(`/admin/cms-pages/${slug}`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCmsPageKeys.list() }),
  });
}

export function useAdminLandingFeatures() {
  const { accessToken } = useAdminAuth();
  return useQuery({
    queryKey: adminLandingFeatureKeys.list(),
    queryFn: () => adminApiFetch<AdminLandingFeature[]>("/admin/landing-features"),
    enabled: Boolean(accessToken),
  });
}

export function useCreateLandingFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLandingFeatureInput) => adminApiFetch<AdminLandingFeature>("/admin/landing-features", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFeatureKeys.list() }),
  });
}

export function useUpdateLandingFeature(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateLandingFeatureInput) =>
      adminApiFetch<AdminLandingFeature>(`/admin/landing-features/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFeatureKeys.list() }),
  });
}

export function useRemoveLandingFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiFetch(`/admin/landing-features/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFeatureKeys.list() }),
  });
}

export function useAdminLandingFaq() {
  const { accessToken } = useAdminAuth();
  return useQuery({
    queryKey: adminLandingFaqKeys.list(),
    queryFn: () => adminApiFetch<AdminLandingFaqItem[]>("/admin/landing-faq"),
    enabled: Boolean(accessToken),
  });
}

export function useCreateLandingFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLandingFaqInput) => adminApiFetch<AdminLandingFaqItem>("/admin/landing-faq", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFaqKeys.list() }),
  });
}

export function useUpdateLandingFaq(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateLandingFaqInput) => adminApiFetch<AdminLandingFaqItem>(`/admin/landing-faq/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFaqKeys.list() }),
  });
}

export function useRemoveLandingFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiFetch(`/admin/landing-faq/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminLandingFaqKeys.list() }),
  });
}
