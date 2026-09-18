"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { CreateKashierCheckoutInput, KashierCheckoutSessionView } from "./types";
import { useAuth } from "../auth/auth-context";
import { kashierCheckoutKeys } from "./query-keys";

export function useKashierCheckouts() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: kashierCheckoutKeys.list(),
    queryFn: () => apiFetch<KashierCheckoutSessionView[]>("/billing/kashier/checkout-sessions"),
    enabled: Boolean(accessToken),
  });
}

export function useCreateKashierCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateKashierCheckoutInput) => apiFetch<{ url: string }>("/billing/kashier/checkout-session", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kashierCheckoutKeys.list() }),
  });
}

/**
 * Polled by the post-redirect return banner (see kashier-return-banner.tsx)
 * — Kashier redirects the browser back before the webhook is guaranteed to
 * have landed, so the UI polls actual server state rather than trusting the
 * (client-controlled) redirect query params for anything but which session
 * to poll.
 */
export function useKashierCheckoutStatus(sessionId: string | null, opts: { pollWhilePending: boolean }) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: kashierCheckoutKeys.detail(sessionId ?? ""),
    queryFn: () => apiFetch<{ status: "pending" | "paid" | "failed" }>(`/billing/kashier/checkout-sessions/${sessionId}`),
    enabled: Boolean(accessToken) && Boolean(sessionId),
    refetchInterval: (query) => (opts.pollWhilePending && query.state.data?.status === "pending" ? 2000 : false),
  });
}
