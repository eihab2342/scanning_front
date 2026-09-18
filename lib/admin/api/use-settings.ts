"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { AdminPlatformSettings, UpdatePlatformSettingsInput } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminSettingsKey } from "./query-keys";

export function useAdminSettings() {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminSettingsKey,
    queryFn: () => adminApiFetch<AdminPlatformSettings>("/admin/settings"),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePlatformSettingsInput) =>
      adminApiFetch<AdminPlatformSettings>("/admin/settings", { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: (updated) => queryClient.setQueryData(adminSettingsKey, updated),
  });
}
