"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { useAuth } from "@/lib/auth/auth-context";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingHeader({ platformName }: { platformName: string }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold tracking-tight text-foreground">{platformName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Login
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              {platformName}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-2 px-4">
            {user ? (
              <Button nativeButton={false} render={<Link href="/dashboard" onClick={() => setMobileOpen(false)} />}>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" nativeButton={false} render={<Link href="/login" onClick={() => setMobileOpen(false)} />}>
                  Login
                </Button>
                <Button nativeButton={false} render={<Link href="/signup" onClick={() => setMobileOpen(false)} />}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
