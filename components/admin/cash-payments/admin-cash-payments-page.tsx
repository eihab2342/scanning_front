"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, Banknote, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCashPayments, useApproveCashPayment, useRejectCashPayment } from "@/lib/admin/api/use-cash-payments";
import { useAdminAuth } from "@/lib/admin/auth/admin-auth-context";
import { canPerform } from "@/lib/admin/role";
import { ApiError } from "@/lib/admin/api/client";
import { AdminCashPaymentRequest } from "@/lib/admin/api/types";
import { formatMoneyCents, formatDateTime } from "@/lib/format";

const STATUS_VARIANT: Record<AdminCashPaymentRequest["status"], "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function RejectDialog({ request, onOpenChange }: { request: AdminCashPaymentRequest | null; onOpenChange: (open: boolean) => void }) {
  const reject = useRejectCashPayment();
  const [reason, setReason] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setReason("");
      reject.reset();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    try {
      await reject.mutateAsync({ id: request.id, reason });
      toast.success("Cash payment request rejected.");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reject request.");
    }
  }

  const submitError = reject.error instanceof ApiError ? reject.error.message : null;

  return (
    <Dialog open={Boolean(request)} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject cash payment request?</DialogTitle>
          <DialogDescription>{request?.organization.name} — {request?.plan.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="reject-reason">Reason</FieldLabel>
            <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} maxLength={500} />
          </Field>
          {submitError ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={reject.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={reject.isPending}>
              {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCashPaymentsPage() {
  const { admin } = useAdminAuth();
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>("pending");
  const listQuery = useAdminCashPayments({ status: statusFilter, pageSize: 50 });
  const approve = useApproveCashPayment();
  const [rejecting, setRejecting] = useState<AdminCashPaymentRequest | null>(null);
  const canReview = canPerform(admin?.role, "cash_payment.review");

  async function handleApprove(request: AdminCashPaymentRequest) {
    try {
      await approve.mutateAsync(request.id);
      toast.success(`${request.organization.name} activated on ${request.plan.name}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to approve request.");
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Cash Payments</h2>
        <p className="text-sm text-muted-foreground">The &quot;cash gateway&quot; review queue — a tenant&apos;s manual alternative to Stripe checkout.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {(["pending", "approved", "rejected", undefined] as const).map((status) => (
          <Button
            key={status ?? "all"}
            type="button"
            variant={statusFilter === status ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status ? status[0].toUpperCase() + status.slice(1) : "All"}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">
        {listQuery.isPending ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : listQuery.isError ? (
          <ErrorState error={listQuery.error} onRetry={() => listQuery.refetch()} />
        ) : listQuery.data.items.length === 0 ? (
          <EmptyState icon={Banknote} title="No cash payment requests" compact />
        ) : (
          <div className="flex flex-col gap-2">
            {listQuery.data.items.map((request) => (
              <Card key={request.id} className="py-3">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/organizations/${request.organizationId}`} className="text-sm font-medium text-foreground hover:underline">
                        {request.organization.name}
                      </Link>
                      <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.plan.name} — {formatMoneyCents(request.amountCents, request.currency)} / {request.billingInterval} — requested{" "}
                      {formatDateTime(request.createdAt)}
                    </p>
                    {request.note ? <p className="mt-1 text-xs text-muted-foreground">Note: {request.note}</p> : null}
                    {request.rejectionReason ? <p className="mt-1 text-xs text-destructive">Rejected: {request.rejectionReason}</p> : null}
                  </div>
                  {canReview && request.status === "pending" ? (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleApprove(request)} disabled={approve.isPending}>
                        <Check className="size-3.5" data-icon="inline-start" />
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRejecting(request)}>
                        <X className="size-3.5" data-icon="inline-start" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RejectDialog request={rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
    </div>
  );
}
