"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { Asset, AssetWithInstructions, CreateAssetInput, VerifyAssetResult } from "./types";
import { useAuth } from "../auth/auth-context";
import { assetKeys, dashboardOverviewKey } from "./query-keys";

export function useAssets() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: assetKeys.list(),
    queryFn: () => apiFetch<Asset[]>("/assets"),
    enabled: Boolean(accessToken),
  });
}

export function useAsset(id: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: assetKeys.detail(id ?? ""),
    queryFn: () => apiFetch<Asset>(`/assets/${id}`),
    enabled: Boolean(accessToken) && Boolean(id),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAssetInput) => apiFetch<AssetWithInstructions>("/assets", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
      queryClient.setQueryData(assetKeys.detail(result.asset.id), result.asset);
    },
  });
}

export function useVerifyAsset(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<VerifyAssetResult>(`/assets/${id}/verify`, { method: "POST" }),
    onSuccess: (result) => {
      queryClient.setQueryData(assetKeys.detail(id), result.asset);
      queryClient.invalidateQueries({ queryKey: assetKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
    },
  });
}

export function useRevokeAsset(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<Asset>(`/assets/${id}`, { method: "DELETE" }),
    onSuccess: (asset) => {
      queryClient.setQueryData(assetKeys.detail(id), asset);
      queryClient.invalidateQueries({ queryKey: assetKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
    },
  });
}
