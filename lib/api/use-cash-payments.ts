"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { CashPaymentRequestView, CreateCashPaymentInput } from "./types";
import { useAuth } from "../auth/auth-context";
import { cashPaymentKeys } from "./query-keys";

export function useCashPayments() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: cashPaymentKeys.list(),
    queryFn: () => apiFetch<CashPaymentRequestView[]>("/billing/cash-payments"),
    enabled: Boolean(accessToken),
  });
}

export function useCreateCashPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCashPaymentInput) => apiFetch<CashPaymentRequestView>("/billing/cash-payments", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cashPaymentKeys.list() }),
  });
}
