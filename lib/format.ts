import { format, formatDistanceToNow } from "date-fns";

export function formatDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatMoneyCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
