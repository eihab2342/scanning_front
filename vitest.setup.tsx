import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { PERMISSIONS } from "@/lib/api/types";

// Global default: every test gets full (owner-equivalent) permissions
// unless it explicitly overrides usePermissions() via the mockPermissions()
// helper in test/test-utils.tsx — mirrors how most existing tests don't
// care about role gating and previously got it "for free" from role
// defaults. Tests that specifically exercise permission gating (Team,
// Assets, Activity, Manage Access, ...) call mockPermissions(...) to narrow
// this per-test.
vi.mock("@/lib/auth/permissions-context", () => ({
  usePermissions: vi.fn(() => ({
    role: "owner",
    permissions: new Set(PERMISSIONS),
    isLoading: false,
    can: () => true,
    canAny: () => true,
  })),
}));

// next/link renders fine standalone in most cases, but mocking it to a plain
// anchor keeps every component test free of any App Router context
// requirement — none of these tests exercise Link's own prefetch behavior.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Components that call useRouter()/usePathname() unconditionally (e.g.
// AddAssetDialog) need a router context even when a test never triggers
// navigation — a no-op default here, overridable per test file with
// vi.mocked(useRouter) where a test needs to assert push()/replace() calls.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
