import { LucideIcon } from "lucide-react";

/**
 * A route exists purely for coherent shell/navigation behavior this phase —
 * the module itself (Assets/Scans/Reports/Team/Billing/Settings/Activity)
 * gets its own dedicated implementation phase. Never fake data here.
 */
export function ComingSoonPage({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
