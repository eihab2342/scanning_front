"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { PlatformHealth } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminHealthKey } from "./query-keys";

export function useAdminHealth() {
  const { accessToken } = useAdminAuth();

  return useQuery({
    queryKey: adminHealthKey,
    queryFn: () => adminApiFetch<PlatformHealth>("/admin/health"),
    enabled: Boolean(accessToken),
    refetchInterval: 30_000,
  });
}
