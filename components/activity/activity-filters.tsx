import { Button } from "@/components/ui/button";
import { ActivityCategory, Permission } from "@/lib/api/types";
import { usePermissions } from "@/lib/auth/permissions-context";

const FILTERS: Array<{ value: ActivityCategory | "all"; label: string; permission?: Permission }> = [
  { value: "all", label: "All" },
  { value: "security", label: "Security", permission: "activity.view_security" },
  { value: "assets", label: "Assets", permission: "activity.view_assets" },
  { value: "scans", label: "Scans", permission: "activity.view_scans" },
  { value: "reports", label: "Reports", permission: "activity.view_reports" },
  { value: "team", label: "Team", permission: "activity.view_team" },
  { value: "billing", label: "Billing", permission: "activity.view_billing" },
];

/** Tabs are permission-filtered — the Activity security fix's frontend half. The backend independently enforces this on every request regardless of what tabs are shown here (see audit-logs.controller.ts). */
export function ActivityFilters({ value, onChange }: { value: ActivityCategory | "all"; onChange: (next: ActivityCategory | "all") => void }) {
  const { can } = usePermissions();
  const visibleFilters = FILTERS.filter((filter) => !filter.permission || can(filter.permission));

  return (
    <div className="flex flex-wrap gap-1.5 px-4 sm:px-6">
      {visibleFilters.map((filter) => (
        <Button key={filter.value} type="button" variant={value === filter.value ? "secondary" : "ghost"} size="sm" onClick={() => onChange(filter.value)}>
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
