"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useDashboardOverview } from "@/lib/api/use-dashboard-overview";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RestrictionBanner } from "@/components/common/restriction-banner";
import { ImpersonationBanner } from "@/components/common/impersonation-banner";
import { consumeExitingImpersonationFlag } from "@/lib/auth/impersonation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const overviewQuery = useDashboardOverview();

  useEffect(() => {
    if (!isInitializing && !user) {
      // Exiting impersonation clears the tenant token reactively, which
      // lands here too — but that flow already knows exactly where it
      // wants to go (back to the admin org page), so this generic
      // "no session -> tenant login" redirect stands down for that one case.
      if (consumeExitingImpersonationFlag()) return;
      router.replace("/login");
    }
  }, [isInitializing, user, router]);

  if (isInitializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  const organization = overviewQuery.data?.organization;
  const planName = overviewQuery.data?.subscription.planName;

  return (
    <div className="flex min-h-screen">
      <Sidebar organizationName={organization?.name} planName={planName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header organizationName={organization?.name} planName={planName} />
        <ImpersonationBanner />
        {overviewQuery.data ? <RestrictionBanner overview={overviewQuery.data} /> : null}
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
