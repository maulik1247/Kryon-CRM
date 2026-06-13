"use client";

import { Badge } from "@/components/ui/badge";
import { TableActions } from "@/components/shared/table-actions";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { ProductExpandedDetails } from "./product-expanded-details";
import type { Product } from "@/lib/types";

interface ProductsMobileListProps {
  products: Product[];
  onOpen: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsMobileList({
  products,
  onOpen,
  onDelete,
}: ProductsMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {products.map((product) => (
        <ExpandableMobileCard
          key={product.id}
          id={product.id}
          expandedId={expandedId}
          onToggle={toggleExpanded}
          summary={
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="default" className="mb-2">
                    {product.motorControllerType}
                  </Badge>
                  <p className="font-display font-semibold leading-snug">
                    {product.model}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {product.sku}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary">
                  ₹{product.sellingPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {product.voltage} V · {product.wattage} W
              </p>
            </div>
          }
          details={<ProductExpandedDetails product={product} />}
          actions={
            <TableActions
              onEdit={() => onOpen(product)}
              onDelete={() => onDelete(product)}
            />
          }
        />
      ))}
    </div>
  );
}
