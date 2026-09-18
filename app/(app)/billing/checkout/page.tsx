import { Suspense } from "react";
import { CheckoutPage } from "@/components/billing/checkout-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-96 rounded-lg sm:m-6" />}>
      <CheckoutPage />
    </Suspense>
  );
}
