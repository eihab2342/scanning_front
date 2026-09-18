"use client";

import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavList } from "./nav-list";
import { APP_NAME } from "@/lib/branding";

export function MobileNav({ organizationName, planName }: { organizationName?: string; planName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu" onClick={() => setOpen(true)}>
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-medium text-foreground">{organizationName ?? "…"}</p>
          <p className="truncate text-xs text-muted-foreground">{planName ? `${planName} plan` : "…"}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
