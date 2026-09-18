import { ShieldCheck } from "lucide-react";
import { NavList } from "./nav-list";
import { APP_NAME } from "@/lib/branding";

export function Sidebar({
  organizationName,
  planName,
}: {
  organizationName?: string;
  planName?: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">{APP_NAME}</span>
      </div>

      <div className="border-b border-sidebar-border px-4 py-3">
        <p className="truncate text-sm font-medium text-sidebar-foreground">{organizationName ?? "…"}</p>
        <p className="truncate text-xs text-muted-foreground">{planName ? `${planName} plan` : "…"}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <NavList />
      </div>
    </aside>
  );
}
