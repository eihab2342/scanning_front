import { Activity, FileCheck2, FileText, Gauge, LucideIcon, ShieldAlert, ShieldCheck, Sparkles, Users } from "lucide-react";

// Admin picks an icon by name (LandingFeatureItem.icon, a plain string —
// never arbitrary/renderable content, see the model's schema comment) from
// this fixed allowlist. An unrecognized or missing name falls back to
// Sparkles rather than erroring.
const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  FileCheck2,
  Gauge,
  Users,
  Activity,
  FileText,
  ShieldAlert,
};

export function landingIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles;
}
