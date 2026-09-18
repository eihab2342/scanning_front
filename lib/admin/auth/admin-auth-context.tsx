"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { adminApiFetch, ApiError } from "../api/client";
import { AdminAuthTokens, AdminJwtPayload, PlatformAdminRole } from "../api/types";
import { decodeAdminJwt, isAdminTokenExpired } from "./jwt";
import { getAdminToken, loadPersistedAdminToken, setAdminSessionExpiredHandler, setAdminToken, subscribeToAdminToken } from "./token-store";

interface AdminUser {
  adminId: string;
  email: string;
  role: PlatformAdminRole;
}

interface AdminAuthContextValue {
  admin: AdminUser | null;
  accessToken: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function adminFromToken(token: string | null): AdminUser | null {
  if (!token) return null;
  const payload: AdminJwtPayload | null = decodeAdminJwt(token);
  if (!payload) return null;
  return { adminId: payload.adminId, email: payload.email, role: payload.role };
}

/**
 * Structurally separate from AuthProvider (lib/auth/auth-context.tsx) —
 * platform admins are not tenant users, so this never touches the tenant
 * token store, never calls /auth/*, and has no notion of an organization.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAdminToken(null);
    queryClient.removeQueries({ queryKey: ["admin"] });
    router.replace("/admin/login");
  }, [router, queryClient]);

  useEffect(() => {
    setAdminSessionExpiredHandler(clearSession);
    return () => setAdminSessionExpiredHandler(null);
  }, [clearSession]);

  useEffect(() => {
    return subscribeToAdminToken(() => {
      const current = getAdminToken();
      setAdmin(adminFromToken(current));
      setAccessToken(current);
    });
  }, []);

  useEffect(() => {
    function hydrate() {
      const persisted = loadPersistedAdminToken();
      if (persisted && !isAdminTokenExpired(persisted)) {
        setAdmin(adminFromToken(persisted));
        setAccessToken(persisted);
      } else if (persisted) {
        setAdminToken(null);
      }
      setIsInitializing(false);
    }
    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await adminApiFetch<AdminAuthTokens>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAdminToken(tokens.accessToken);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AdminAuthContext.Provider value={{ admin, accessToken, isInitializing, login, logout }}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export { ApiError };
