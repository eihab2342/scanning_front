"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrganization } from "@/lib/admin/api/use-organizations";
import { AdminOrgHeader } from "./admin-org-header";
import { AdminOrgOverviewTab } from "./admin-org-overview-tab";
import { AdminOrgSubscriptionTab } from "./admin-org-subscription-tab";
import { AdminOrgLimitsTab } from "./admin-org-limits-tab";
import { AdminOrgBillingEventsTab } from "./admin-org-billing-events-tab";
import { AdminOrgAuditTab } from "./admin-org-audit-tab";

type OrgDetailTab = "overview" | "subscription" | "limits" | "billing" | "audit";

const TABS: Array<{ value: OrgDetailTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "subscription", label: "Subscription" },
  { value: "limits", label: "Usage & Limits" },
  { value: "billing", label: "Billing Events" },
  { value: "audit", label: "Audit" },
];

export function AdminOrgDetailPage({ organizationId }: { organizationId: string }) {
  const organizationQuery = useAdminOrganization(organizationId);
  const [tab, setTab] = useState<OrgDetailTab>("overview");

  if (organizationQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (organizationQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState error={organizationQuery.error} onRetry={() => organizationQuery.refetch()} />
      </div>
    );
  }

  const organization = organizationQuery.data;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <AdminOrgHeader organization={organization} />

      <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
        {TABS.map((t) => (
          <Button key={t.value} type="button" variant={tab === t.value ? "secondary" : "ghost"} size="sm" onClick={() => setTab(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-4 sm:px-6">
        {tab === "overview" ? <AdminOrgOverviewTab organization={organization} /> : null}
        {tab === "subscription" ? <AdminOrgSubscriptionTab organization={organization} /> : null}
        {tab === "limits" ? <AdminOrgLimitsTab organization={organization} /> : null}
        {tab === "billing" ? <AdminOrgBillingEventsTab organizationId={organization.id} /> : null}
        {tab === "audit" ? <AdminOrgAuditTab organizationId={organization.id} /> : null}
      </div>
    </div>
  );
}
