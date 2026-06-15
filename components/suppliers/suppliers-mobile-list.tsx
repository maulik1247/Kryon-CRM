"use client";

import { Badge } from "@/components/ui/badge";
import { TableActions } from "@/components/shared/table-actions";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { SupplierExpandedDetails } from "./supplier-expanded-details";
import type { Supplier } from "@/lib/types";

interface SuppliersMobileListProps {
  suppliers: Supplier[];
  onOpen: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SuppliersMobileList({
  suppliers,
  onOpen,
  onDelete,
}: SuppliersMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {suppliers.map((supplier) => (
        <ExpandableMobileCard
          key={supplier.id}
          id={supplier.id}
          expandedId={expandedId}
          onToggle={toggleExpanded}
          summary={
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-2">
                    {supplier.type}
                  </Badge>
                  <p className="font-display font-semibold leading-snug">
                    {supplier.name}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{supplier.region}</p>
            </div>
          }
          details={<SupplierExpandedDetails supplier={supplier} />}
          actions={
            <TableActions
              onEdit={() => onOpen(supplier)}
              onDelete={() => onDelete(supplier)}
            />
          }
        />
      ))}
    </div>
  );
}
