"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminUserMenu } from "./admin-user-menu";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { adminPageTitleForPath } from "./nav-config";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { roleLabel } from "@/lib/admin/role";

export function AdminHeader() {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const title = adminPageTitleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <AdminMobileNav adminEmail={admin?.email} roleLabel={admin ? roleLabel(admin.role) : undefined} />
      <h1 className="flex-1 truncate text-sm font-semibold text-foreground">{title}</h1>
      {admin ? (
        <Badge variant="outline" className="hidden sm:inline-flex">
          {roleLabel(admin.role)}
        </Badge>
      ) : null}
      <ThemeToggle />
      <AdminUserMenu />
    </header>
  );
}
