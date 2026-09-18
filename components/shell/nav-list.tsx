"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "./nav-config";
import { usePermissions } from "@/lib/auth/permissions-context";

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can } = usePermissions();

  return (
    <nav className="flex flex-col gap-4">
      {NAV_SECTIONS.map((section, index) => {
        const items = section.items.filter((item) => !item.permission || can(item.permission));
        if (items.length === 0) return null;

        return (
          <div key={section.label ?? index} className="flex flex-col gap-0.5">
            {section.label ? (
              <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{section.label}</p>
            ) : null}
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
