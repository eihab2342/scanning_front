import { ShieldAlert } from "lucide-react";
import { AdminNavList } from "./admin-nav-list";
import { APP_NAME } from "@/lib/branding";

/**
 * Deliberately its own component, not a reused/parameterized tenant Sidebar
 * — a visually distinct (amber accent) "you are in platform admin, not a
 * tenant workspace" identity, per the phase brief's separation requirement.
 */
export function AdminSidebar({ adminEmail, roleLabel }: { adminEmail?: string; roleLabel?: string }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldAlert className="size-5 text-amber-500" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">{APP_NAME} Admin</span>
      </div>

      <div className="border-b border-sidebar-border px-4 py-3">
        <p className="truncate text-sm font-medium text-sidebar-foreground">{adminEmail ?? "…"}</p>
        <p className="truncate text-xs text-muted-foreground">{roleLabel ?? "…"}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <AdminNavList />
      </div>
    </aside>
  );
}
