import { Asset } from "@/lib/api/types";

/** A single restrained strip, not a row of decorative cards — see the phase brief's "keep it restrained" guidance. */
export function AssetStatusSummary({ assets }: { assets: Asset[] }) {
  const total = assets.length;
  const verified = assets.filter((a) => a.ownershipStatus === "verified").length;
  const pending = assets.filter((a) => a.ownershipStatus === "pending").length;
  const attention = assets.filter((a) => a.ownershipStatus === "revoked").length;

  const items = [
    { label: "Total", value: total },
    { label: "Verified", value: verified },
    { label: "Pending", value: pending },
    { label: "Requires attention", value: attention },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-foreground/10 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5 bg-card px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          <span className="text-lg font-semibold tracking-tight text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
