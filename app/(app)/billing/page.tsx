import { Suspense } from "react";
import { BillingPage } from "@/components/billing/billing-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-96 rounded-lg sm:m-6" />}>
      <BillingPage />
    </Suspense>
  );
}
