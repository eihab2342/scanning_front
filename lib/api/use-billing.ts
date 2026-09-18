"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import {
  ChangeBillingPlanInput,
  CreateCheckoutSessionInput,
  PublicPlanView,
  ResolvedEntitlements,
  SubscriptionView,
} from "./types";
import { useAuth } from "../auth/auth-context";
import { billingKeys, dashboardOverviewKey } from "./query-keys";

export function useSubscription() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => apiFetch<SubscriptionView>("/subscriptions/me"),
    enabled: Boolean(accessToken),
  });
}

export function useEntitlements() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: billingKeys.entitlements(),
    queryFn: () => apiFetch<ResolvedEntitlements>("/subscriptions/me/entitlements"),
    enabled: Boolean(accessToken),
  });
}

export function usePlans() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => apiFetch<PublicPlanView[]>("/plans"),
    enabled: Boolean(accessToken),
  });
}

/** A billing mutation always changes what the org can see/do next — subscription, entitlements, and the dashboard's usage numbers all depend on it. */
function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    queryClient.invalidateQueries({ queryKey: billingKeys.entitlements() });
    queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
  };
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (dto: CreateCheckoutSessionInput) => apiFetch<{ url: string }>("/billing/checkout-session", { method: "POST", body: JSON.stringify(dto) }),
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => apiFetch<{ url: string }>("/billing/portal", { method: "POST" }),
  });
}

/**
 * The confirming Stripe webhook — not this response — is what actually
 * updates planId/scanQuota (see BillingService.requestPlanChange's doc
 * comment). The invalidation here just re-fetches current state; the
 * caller's UI should make clear the change may take a few seconds to land.
 */
export function useChangePlan() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (dto: ChangeBillingPlanInput) => apiFetch<{ requested: true }>("/billing/change-plan", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => invalidate(),
  });
}

export function useCancelSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => apiFetch<SubscriptionView>("/billing/cancel", { method: "POST" }),
    onSuccess: () => invalidate(),
  });
}

export function useReactivateSubscription() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => apiFetch<SubscriptionView>("/billing/reactivate", { method: "POST" }),
    onSuccess: () => invalidate(),
  });
}
