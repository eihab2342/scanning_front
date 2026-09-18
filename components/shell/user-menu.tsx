"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
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
import { useAuth } from "@/lib/auth/auth-context";
import { roleLabel } from "@/lib/role";

function initialsFromEmail(email?: string): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 gap-2 px-1.5" aria-label={`Account menu for ${user.email}`}>
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initialsFromEmail(user.email)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{user.email}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">{user.email}</span>
            <span className="text-xs font-normal text-muted-foreground">{roleLabel(user.role)}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <UserIcon className="size-4" data-icon="inline-start" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          <LogOut className="size-4" data-icon="inline-start" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
