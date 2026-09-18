"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { CreateScanInput, NON_TERMINAL_SCAN_STATUSES, Scan, ScanListView } from "./types";
import { useAuth } from "../auth/auth-context";
import { scanKeys, dashboardOverviewKey } from "./query-keys";

export interface ScanListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  assetId?: string;
}

function buildScansQueryString(params: ScanListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.assetId) search.set("assetId", params.assetId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Poll only while at least one visible scan is non-terminal — completed/failed
// scans stop polling entirely, and there is no polling at all for an
// all-terminal page (e.g. an empty or fully-completed list).
const LIST_POLL_MS = 4000;
const DETAIL_POLL_MS = 3000;

export function useScans(params: ScanListParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: scanKeys.list(params as Record<string, string | number | undefined>),
    queryFn: () => apiFetch<ScanListView>(`/scans${buildScansQueryString(params)}`),
    enabled: Boolean(accessToken),
    refetchInterval: (query) => {
      const data = query.state.data as ScanListView | undefined;
      const hasActive = data?.items.some((s) => NON_TERMINAL_SCAN_STATUSES.includes(s.status));
      return hasActive ? LIST_POLL_MS : false;
    },
  });
}

export function useScan(id: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: scanKeys.detail(id ?? ""),
    queryFn: () => apiFetch<Scan>(`/scans/${id}`),
    enabled: Boolean(accessToken) && Boolean(id),
    refetchInterval: (query) => {
      const status = (query.state.data as Scan | undefined)?.status;
      return status && NON_TERMINAL_SCAN_STATUSES.includes(status) ? DETAIL_POLL_MS : false;
    },
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateScanInput) => apiFetch<Scan>("/scans", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (scan) => {
      queryClient.invalidateQueries({ queryKey: scanKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardOverviewKey });
      queryClient.setQueryData(scanKeys.detail(scan.id), scan);
    },
  });
}
