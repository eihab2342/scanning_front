import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { usePermissions } from "@/lib/auth/permissions-context";
import { Permission, Role } from "@/lib/api/types";

export function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return { queryClient, ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>) };
}

/** Narrows the globally-mocked usePermissions() (see vitest.setup.tsx) to an explicit permission set for one test. */
export function mockPermissions(permissions: Permission[], role: Role = "owner") {
  const set = new Set(permissions);
  vi.mocked(usePermissions).mockReturnValue({
    role,
    permissions: set,
    isLoading: false,
    can: (permission) => set.has(permission),
    canAny: (candidates) => candidates.some((permission) => set.has(permission)),
  });
}
