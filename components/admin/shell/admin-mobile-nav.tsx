"use client";

import { useState } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminNavList } from "./admin-nav-list";
import { APP_NAME } from "@/lib/branding";

export function AdminMobileNav({ adminEmail, roleLabel }: { adminEmail?: string; roleLabel?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation menu" onClick={() => setOpen(true)}>
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <ShieldAlert className="size-5 text-amber-500" aria-hidden="true" />
            {APP_NAME} Admin
          </SheetTitle>
        </SheetHeader>
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-medium text-foreground">{adminEmail ?? "…"}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel ?? "…"}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <AdminNavList onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
