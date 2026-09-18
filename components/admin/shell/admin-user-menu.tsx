"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { roleLabel } from "@/lib/admin/role";

function initialsFromEmail(email?: string): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

export function AdminUserMenu() {
  const { admin, logout } = useAdminAuth();
  if (!admin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 gap-2 px-1.5" aria-label={`Admin account menu for ${admin.email}`}>
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initialsFromEmail(admin.email)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{admin.email}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">{admin.email}</span>
            <span className="text-xs font-normal text-muted-foreground">{roleLabel(admin.role)}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          <LogOut className="size-4" data-icon="inline-start" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
