import type { Metadata } from "next";
import { AdminAuthProvider } from "@/lib/admin/auth/admin-auth-context";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `${APP_NAME} — Platform Admin`,
  description: "Platform-admin console: organizations, plans, features, billing, and audit.",
};

// Scoped to the /admin subtree only — AdminAuthProvider is a completely
// separate identity system from the tenant AuthProvider (root layout.tsx)
// and must never be conflated with it (see saas-handoff.md §12.5).
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
