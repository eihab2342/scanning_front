"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { EffectivePermissionsResponse, MemberPermissionsView, UpdateMemberPermissionsInput } from "./types";
import { useAuth } from "../auth/auth-context";
import { permissionsKeys, teamKeys } from "./query-keys";

/** Backs the frontend PermissionsProvider — the effective {role, permissions} for the signed-in user. */
export function useMyPermissions() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: permissionsKeys.me(),
    queryFn: () => apiFetch<EffectivePermissionsResponse>("/auth/me/permissions"),
    enabled: Boolean(accessToken),
  });
}

/** Backs the Manage Access dialog — role defaults, overrides, and the resolved effective set for one team member. */
export function useMemberPermissions(userId: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: permissionsKeys.member(userId),
    queryFn: () => apiFetch<MemberPermissionsView>(`/users/${userId}/permissions`),
    enabled: Boolean(accessToken) && enabled,
  });
}

/** A permission change can affect the actor's own delegatable set too (e.g. after being granted an override) — invalidate both. */
function useInvalidatePermissions(userId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: permissionsKeys.member(userId) });
    queryClient.invalidateQueries({ queryKey: permissionsKeys.me() });
    queryClient.invalidateQueries({ queryKey: teamKeys.list() });
  };
}

export function useUpdateMemberPermissions(userId: string) {
  const invalidate = useInvalidatePermissions(userId);

  return useMutation({
    mutationFn: (dto: UpdateMemberPermissionsInput) =>
      apiFetch<MemberPermissionsView>(`/users/${userId}/permissions`, { method: "PUT", body: JSON.stringify(dto) }),
    onSuccess: () => invalidate(),
  });
}

export function useResetMemberPermissions(userId: string) {
  const invalidate = useInvalidatePermissions(userId);

  return useMutation({
    mutationFn: () => apiFetch<MemberPermissionsView>(`/users/${userId}/permissions/reset`, { method: "POST" }),
    onSuccess: () => invalidate(),
  });
}
