import { Suspense } from "react";
import { ScansPage } from "@/components/scans/scans-page";
import { ScansSkeleton } from "@/components/scans/scans-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<ScansSkeleton />}>
      <ScansPage />
    </Suspense>
  );
}
