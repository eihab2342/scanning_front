import { Archive, Pencil } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminFeature } from "@/lib/admin/api/types";

interface AdminFeaturesTableProps {
  features: AdminFeature[];
  canWrite: boolean;
  onEdit: (feature: AdminFeature) => void;
  onArchive: (feature: AdminFeature) => void;
}

export function AdminFeaturesTable({ features, canWrite, onEdit, onArchive }: AdminFeaturesTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg ring-1 ring-foreground/10 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Feature</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.id}>
              <TableCell className="font-medium text-foreground">{feature.name}</TableCell>
              <TableCell className="text-muted-foreground">{feature.key}</TableCell>
              <TableCell className="text-muted-foreground">{feature.type}</TableCell>
              <TableCell>{feature.isActive ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Archived</Badge>}</TableCell>
              <TableCell>
                {canWrite ? (
                  <div className="flex justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
