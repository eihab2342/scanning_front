"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { ChangePasswordInput, SafeUserView } from "./types";
import { useAuth } from "../auth/auth-context";
import { profileKeys } from "./query-keys";

/** GET /api/auth/me — fields (createdAt) the JWT payload alone doesn't carry, needed for the profile tab. */
export function useCurrentUser() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => apiFetch<SafeUserView>("/auth/me"),
    enabled: Boolean(accessToken),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordInput) => apiFetch<{ success: boolean }>("/auth/change-password", { method: "POST", body: JSON.stringify(dto) }),
  });
}
