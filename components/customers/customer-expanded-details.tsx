import { PriorityBadge } from "@/components/shared/priority-badge";
import { DetailGrid } from "@/components/shared/detail-grid";
import type { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CustomerExpandedDetails({ customer }: { customer: Customer }) {
  return (
    <DetailGrid
      items={[
        { label: "OEM segment", value: customer.oemSegment },
        { label: "Lead source", value: customer.leadSource },
        { label: "Lead date", value: customer.leadDate },
        {
          label: "Plant locations",
          value: customer.plantLocations.join("; ") || undefined,
          className: "col-span-2",
        },
        { label: "Production capacity", value: customer.productionCapacity },
        { label: "Annual revenue", value: customer.annualRevenueRange },
        { label: "GSTIN", value: customer.gstin, mono: true },
        { label: "Website", value: customer.websiteUrl },
        {
          label: "Registered office",
          value: customer.registeredOfficeAddress,
          className: "col-span-2",
        },
        {
          label: "Factory address",
          value: customer.factoryAddress,
          className: "col-span-2",
        },
        { label: "Vendor status", value: customer.vendorStatus },
        { label: "Vendor code", value: customer.vendorCode, mono: true },
        {
          label: "Priority",
          children: <PriorityBadge priority={customer.priority} />,
        },
        { label: "Tier", value: customer.tier },
        { label: "Account owner", value: customer.accountOwner },
        {
          label: "Est. annual potential",
          value: customer.estimatedAnnualPotential
            ? `₹${Number(customer.estimatedAnnualPotential).toLocaleString("en-IN")}`
            : undefined,
        },
        { label: "Added on", value: formatDate(customer.createdAt) },
        {
          label: "Notes",
          value: customer.notes,
          className: "col-span-2",
        },
        {
          label: "Customer products",
          value:
            customer.customerProducts.length > 0
              ? `${customer.customerProducts.length} product(s) on file`
              : undefined,
        },
      ]}
    />
  );
}
