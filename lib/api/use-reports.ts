"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch, API_BASE_URL, ApiError } from "./client";
import { Report } from "./types";
import { useAuth } from "../auth/auth-context";
import { reportKeys } from "./query-keys";
import { getTokens } from "../auth/token-store";

export function useReports() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: reportKeys.list(),
    queryFn: () => apiFetch<Report[]>("/reports"),
    enabled: Boolean(accessToken),
  });
}

export function useReport(id: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: reportKeys.detail(id ?? ""),
    queryFn: () => apiFetch<Report>(`/reports/${id}`),
    enabled: Boolean(accessToken) && Boolean(id),
  });
}

/**
 * The download endpoint returns a plain-text file body, not JSON — apiFetch
 * always parses as JSON, so this does its own fetch (same Bearer-token
 * attachment as apiFetch) and triggers a real browser file save from the
 * response blob, using the server's own Content-Disposition filename.
 */
async function downloadReport(id: string): Promise<void> {
  const tokens = getTokens();
  const res = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
    headers: tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
  });
  if (!res.ok) {
    throw new ApiError(res.status, "This report could not be downloaded.");
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? `report-${id}.txt`;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (id: string) => downloadReport(id),
  });
}
