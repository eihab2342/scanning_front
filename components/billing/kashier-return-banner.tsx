"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useKashierCheckoutStatus } from "@/lib/api/use-kashier-checkout";
import { billingKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Kashier redirects the browser back to /billing?kashierSession=<id> before
 * its webhook is guaranteed to have landed — this polls the session's real
 * server-side status (never trusts redirect query params for anything but
 * which session to poll) and shows the actual outcome once it resolves.
 */
export function KashierReturnBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get("kashierSession");
  const statusQuery = useKashierCheckoutStatus(sessionId, { pollWhilePending: true });

  useEffect(() => {
    if (!sessionId || !statusQuery.data || statusQuery.data.status === "pending") return;

    if (statusQuery.data.status === "paid") {
      toast.success("Payment received — your plan has been activated.");
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    } else {
      toast.error("This Kashier payment did not succeed.");
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("kashierSession");
    router.replace(params.size > 0 ? `/billing?${params.toString()}` : "/billing");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the resolved status itself changes
  }, [statusQuery.data?.status]);

  if (!sessionId || !statusQuery.data || statusQuery.data.status !== "pending") return null;

  return (
    <Alert>
      <Loader2 className="animate-spin" />
      <AlertDescription>Confirming your Kashier payment…</AlertDescription>
    </Alert>
  );
}
