"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TableActions } from "@/components/shared/table-actions";
import { getVendorStatusVariant } from "@/lib/vendor-status";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/types";
import { CustomerExpandedDetails } from "./customer-expanded-details";

function plantLocationSummary(locations: string[]) {
  if (locations.length === 0) return "No plants";
  if (locations.length === 1) return locations[0];
  return `${locations.length} plant locations`;
}

interface CustomersMobileListProps {
  customers: Customer[];
  expandedId: string | null;
  onToggleExpanded: (customerId: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomersMobileList({
  customers,
  expandedId,
  onToggleExpanded,
  onEdit,
  onDelete,
}: CustomersMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {customers.map((customer) => {
        const isExpanded = expandedId === customer.id;

        return (
          <Card
            key={customer.id}
            className="overflow-hidden border-border/60 shadow-sm transition-smooth hover:shadow-md"
          >
            <button
              type="button"
              className="flex w-full items-start gap-3 p-4 text-left"
              onClick={() => onToggleExpanded(customer.id)}
            >
              <ChevronRight
                className={cn(
                  "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <UserAvatar name={customer.accountOwner} />
                    <div className="min-w-0">
                      <p className="font-display font-semibold leading-snug">
                        {customer.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {customer.accountOwner}
                      </p>
                    </div>
                  </div>
                  <PriorityBadge priority={customer.priority} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{customer.oemSegment}</span>
                  <span>·</span>
                  <span>{customer.tier}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={getVendorStatusVariant(customer.vendorStatus)}
                    className="text-xs"
                  >
                    {customer.vendorStatus}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {plantLocationSummary(customer.plantLocations)}
                  </Badge>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t bg-muted/20 px-4 py-4">
                <CustomerExpandedDetails customer={customer} />
              </div>
            )}

            <div className="flex justify-end border-t px-3 py-2">
              <TableActions
                onEdit={() => onEdit(customer)}
                onDelete={() => onDelete(customer)}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
