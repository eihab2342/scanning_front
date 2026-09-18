"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { pageTitleForPath } from "./nav-config";

export function Header({
  organizationName,
  planName,
  action,
}: {
  organizationName?: string;
  planName?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pageTitleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <MobileNav organizationName={organizationName} planName={planName} />
      <h1 className="flex-1 truncate text-sm font-semibold text-foreground">{title}</h1>
      {action}
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
