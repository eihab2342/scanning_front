import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminBillingEventsPage } from "@/components/admin/billing-events/admin-billing-events-page";

export default function BillingEventsPage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-80 rounded-lg sm:m-6" />}>
      <AdminBillingEventsPage />
    </Suspense>
  );
}
