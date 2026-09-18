import { ScanStatus } from "./api/types";

export function isTerminalScanStatus(status: ScanStatus): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}

/** Only meaningful once completedAt exists — never fabricates a duration for an in-progress scan. */
export function formatScanDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  if (ms < 1000) return "<1s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
