"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TableActions } from "@/components/shared/table-actions";
import { getVendorStatusVariant } from "@/lib/vendor-status";
import type { Customer } from "@/lib/types";

function plantLocationSummary(locations: string[]) {
  if (locations.length === 0) return "No plants";
  if (locations.length === 1) return locations[0];
  return `${locations.length} plant locations`;
}

interface CustomersMobileListProps {
  customers: Customer[];
  onOpen: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomersMobileList({
  customers,
  onOpen,
  onDelete,
}: CustomersMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className="overflow-hidden border-border/60 shadow-sm transition-smooth hover:shadow-md"
        >
          <button
            type="button"
            className="w-full p-4 text-left"
            onClick={() => onOpen(customer)}
          >
            <div className="space-y-3">
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
          <div
            className="flex justify-end border-t px-3 py-2"
            onClick={(event) => event.stopPropagation()}
          >
            <TableActions
              onEdit={() => onOpen(customer)}
              onDelete={() => onDelete(customer)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
