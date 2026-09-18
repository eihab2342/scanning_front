"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { InviteMemberInput, TeamMember, UpdateMemberRoleInput } from "./types";
import { useAuth } from "../auth/auth-context";
import { teamKeys, dashboardOverviewKey, activityKeys } from "./query-keys";

export function useTeam() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: () => apiFetch<TeamMember[]>("/users"),
    enabled: Boolean(accessToken),
  });
}

/** Every team mutation affects the same three surfaces: the list itself, the dashboard's seat count, and the activity feed. */
function useInvalidateTeamRelated() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: teamKeys.list() });
    queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
    queryClient.invalidateQueries({ queryKey: activityKeys.all });
  };
}

export function useInviteMember() {
  const invalidate = useInvalidateTeamRelated();

  return useMutation({
    mutationFn: (dto: InviteMemberInput) => apiFetch<TeamMember>("/users/invite", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => invalidate(),
  });
}

export function useChangeMemberRole(id: string) {
  const invalidate = useInvalidateTeamRelated();

  return useMutation({
    mutationFn: (dto: UpdateMemberRoleInput) => apiFetch<TeamMember>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => invalidate(),
  });
}

export function useDeactivateMember(id: string) {
  const invalidate = useInvalidateTeamRelated();

  return useMutation({
    mutationFn: () => apiFetch<TeamMember>(`/users/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => invalidate(),
  });
}

export function useReactivateMember(id: string) {
  const invalidate = useInvalidateTeamRelated();

  return useMutation({
    mutationFn: () => apiFetch<TeamMember>(`/users/${id}/reactivate`, { method: "PATCH" }),
    onSuccess: () => invalidate(),
  });
}
