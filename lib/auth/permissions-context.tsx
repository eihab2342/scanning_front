"use client";

import { createContext, useContext, useMemo } from "react";
import { useMyPermissions } from "../api/use-permissions";
import { useAuth } from "./auth-context";
import { Permission, Role } from "../api/types";

interface PermissionsContextValue {
  role: Role | null;
  permissions: Set<Permission>;
  /** True only while the very first fetch (post-login) is in flight — mirrors AuthProvider's isInitializing distinction. */
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Wraps AuthProvider's tree — resolves once per session (React Query keeps
 * it fresh) rather than every component re-deriving role logic itself. This
 * is the frontend half of "stop using role as primary authorization" (see
 * permission-catalog.ts on the backend): components call can(permission),
 * not roleAtLeast(role, ...), for anything that gates an actual capability.
 * Role stays available for display/hierarchy UX (see lib/role.ts).
 */
export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const query = useMyPermissions();

  const permissions = useMemo(() => new Set(query.data?.permissions ?? []), [query.data]);

  const value = useMemo<PermissionsContextValue>(
    () => ({
      role: user?.role ?? null,
      permissions,
      isLoading: Boolean(user) && query.isPending,
      can: (permission) => permissions.has(permission),
      canAny: (candidates) => candidates.some((permission) => permissions.has(permission)),
    }),
    [user, permissions, query.isPending],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionsProvider");
  return ctx;
}
