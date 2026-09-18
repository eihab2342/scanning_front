import { Archive, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminFeature } from "@/lib/admin/api/types";

interface AdminFeaturesListMobileProps {
  features: AdminFeature[];
  canWrite: boolean;
  onEdit: (feature: AdminFeature) => void;
  onArchive: (feature: AdminFeature) => void;
}

export function AdminFeaturesListMobile({ features, canWrite, onEdit, onArchive }: AdminFeaturesListMobileProps) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {features.map((feature) => (
        <Card key={feature.id} size="sm">
          <CardContent className="flex items-start justify-between gap-2 px-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium text-foreground">{feature.name}</span>
              <span className="text-xs text-muted-foreground">
                {feature.key} · {feature.type}
              </span>
              {feature.isActive ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Archived</Badge>}
            </div>
            {canWrite ? (
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${feature.name}`} onClick={() => onEdit(feature)}>
                  <Pencil className="size-3.5" />
                </Button>
                {feature.isActive ? (
                  <Button variant="ghost" size="icon-sm" aria-label={`Archive ${feature.name}`} onClick={() => onArchive(feature)}>
                    <Archive className="size-3.5 text-destructive" />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
