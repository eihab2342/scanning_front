"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "./client";
import { AdminCashPaymentListView, AdminCashPaymentRequest, ListCashPaymentsParams } from "./types";
import { useAdminAuth } from "../auth/admin-auth-context";
import { adminCashPaymentKeys } from "./query-keys";

export function useAdminCashPayments(params: ListCashPaymentsParams = {}) {
  const { accessToken } = useAdminAuth();
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.organizationId) search.set("organizationId", params.organizationId);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const query = search.toString();

  return useQuery({
    queryKey: adminCashPaymentKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => adminApiFetch<AdminCashPaymentListView>(`/admin/cash-payments${query ? `?${query}` : ""}`),
    enabled: Boolean(accessToken),
  });
}

export function useApproveCashPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiFetch<AdminCashPaymentRequest>(`/admin/cash-payments/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCashPaymentKeys.all }),
  });
}

export function useRejectCashPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApiFetch<AdminCashPaymentRequest>(`/admin/cash-payments/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCashPaymentKeys.all }),
  });
}
