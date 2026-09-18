"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { roleLabel } from "@/lib/admin/role";

/**
 * Client-side redirect only, exactly like the tenant DashboardShell's own
 * "no user -> /login" check — this is UX, not the security boundary. The
 * real boundary is the backend's AdminJwtAuthGuard/PlatformRolesGuard,
 * which rejects every /admin/* API call independently of what this
 * component does (frontend hiding alone is not security).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, isInitializing } = useAdminAuth();

  useEffect(() => {
    if (!isInitializing && !admin) router.replace("/admin/login");
  }, [isInitializing, admin, router]);

  if (isInitializing || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminEmail={admin.email} roleLabel={roleLabel(admin.role)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
