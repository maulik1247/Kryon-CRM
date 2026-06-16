"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterCustomersBySearch } from "@/lib/deal-form-helpers";
import type { Contact, Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerSearchSelectProps {
  id?: string;
  customers: Customer[];
  contacts: Contact[];
  value: string;
  onValueChange: (customerId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CustomerSearchSelect({
  id,
  customers,
  contacts,
  value,
  onValueChange,
  disabled,
  placeholder = "Search by name, phone, or city",
}: CustomerSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedCustomer = customers.find((customer) => customer.id === value);
  const filteredCustomers = React.useMemo(
    () => filterCustomersBySearch(customers, contacts, query),
    [customers, contacts, query]
  );

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const getCustomerSubtitle = (customer: Customer) => {
    const customerContacts = contacts.filter(
      (contact) => contact.customerId === customer.id
    );
    const phone = customerContacts[0]?.phone;
    const city = customer.plantLocations[0];
    return [phone, city].filter(Boolean).join(" · ");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || customers.length === 0}
          className="h-10 w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedCustomer?.name ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={12}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="border-b p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone, or city"
            autoFocus
          />
        </div>
        <div
          className="max-h-60 overflow-y-auto overscroll-contain p-1"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {filteredCustomers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No customers found.
            </p>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent",
                  value === customer.id && "bg-accent"
                )}
                onClick={() => {
                  onValueChange(customer.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    value === customer.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{customer.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {getCustomerSubtitle(customer)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
