"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../api/client";
import { AuthTokens, JwtPayload } from "../api/types";
import { decodeJwt, isTokenExpired } from "./jwt";
import { getTokens, loadPersistedTokens, setSessionExpiredHandler, setTokens, subscribeToTokens } from "./token-store";

interface AuthUser {
  userId: string;
  organizationId: string;
  role: JwtPayload["role"];
  email?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  /** True only while the very first token hydration/refresh check is running — distinct from "logged out". */
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (organizationName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromTokens(tokens: AuthTokens | null): AuthUser | null {
  if (!tokens) return null;
  const payload = decodeJwt(tokens.accessToken);
  if (!payload) return null;
  return { userId: payload.userId, organizationId: payload.organizationId, role: payload.role, email: payload.email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setTokens(null);
    queryClient.clear();
    router.replace("/login");
  }, [router, queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  useEffect(() => {
    return subscribeToTokens(() => {
      const current = getTokens();
      setUser(userFromTokens(current));
      setAccessToken(current?.accessToken ?? null);
    });
  }, []);

  // One-time hydration on mount: a stored refresh token but an expired
  // access token is the normal case after the browser was closed for a
  // while (access tokens live 15m, refresh tokens 7d) — refresh once up
  // front instead of waiting for the first API call to hit a 401.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const persisted = loadPersistedTokens();
      if (!persisted) {
        if (!cancelled) setIsInitializing(false);
        return;
      }

      if (!isTokenExpired(persisted.accessToken)) {
        setUser(userFromTokens(persisted));
        setAccessToken(persisted.accessToken);
        if (!cancelled) setIsInitializing(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api"}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: persisted.refreshToken }),
        });
        if (res.ok) {
          const data = (await res.json()) as { accessToken: string };
          const next = { accessToken: data.accessToken, refreshToken: persisted.refreshToken };
          setTokens(next);
        } else {
          setTokens(null);
        }
      } catch {
        setTokens(null);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiFetch<AuthTokens>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setTokens(tokens);
  }, []);

  const signup = useCallback(async (organizationName: string, email: string, password: string) => {
    const tokens = await apiFetch<AuthTokens>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ organizationName, email, password }),
    });
    setTokens(tokens);
  }, []);

  // No /auth/logout endpoint exists on the backend (Bearer-token design,
  // no server-side token blocklist) — logout is purely local token discard,
  // confirmed against the real auth module rather than assumed.
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isInitializing, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
