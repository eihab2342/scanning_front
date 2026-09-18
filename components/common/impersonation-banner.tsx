"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTokens } from "@/lib/auth/token-store";
import { clearImpersonationSession, getImpersonationSession, ImpersonationSession, markExitingImpersonation } from "@/lib/auth/impersonation";

/**
 * Shown across the top of the tenant app whenever the current session was
 * opened via platform-admin impersonation (never silent — see
 * ImpersonationService's schema comment) so it's never mistaken for the
 * admin's own account.
 */
export function ImpersonationBanner() {
  const router = useRouter();
  const [session, setSession] = useState<ImpersonationSession | null>(null);

  useEffect(() => {
    function hydrate() {
      setSession(getImpersonationSession());
    }
    hydrate();
  }, []);

  if (!session) return null;

  function handleExit() {
    const organizationId = session!.organizationId;
    markExitingImpersonation();
    router.replace(`/admin/organizations/${organizationId}`);
    clearImpersonationSession();
    setTokens(null);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-600/30 bg-amber-50 px-4 py-2 text-sm text-amber-900 sm:px-6 dark:bg-amber-500/10 dark:text-amber-300">
      <div className="flex items-center gap-2">
        <Eye className="size-4 shrink-0" aria-hidden="true" />
        <span>
          Viewing <strong>{session.organizationName}</strong> as {session.actingAsEmail} — platform-admin impersonation session.
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={handleExit} className="border-amber-600/40 bg-transparent hover:bg-amber-100 dark:hover:bg-amber-500/20">
        <LogOut className="size-3.5" data-icon="inline-start" />
        Exit impersonation
      </Button>
    </div>
  );
}
