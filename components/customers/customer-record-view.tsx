"use client";

import { CustomerForm } from "@/components/customers/customer-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes } from "@/lib/record-routes";

export function CustomerRecordView({ customerId }: { customerId: string }) {
  const { getCustomerById } = useCrmData();
  const customer = getCustomerById(customerId);

  if (!customer) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.customer}
        backLabel="customers"
      />
    );
  }

  return <CustomerForm customerId={customerId} />;
}
