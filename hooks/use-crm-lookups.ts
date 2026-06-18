"use client";

import * as React from "react";
import { useCrmData } from "@/lib/crm-data-provider";
import { buildEntityMap } from "@/lib/entity-maps";

export function useCrmLookups() {
  const { customers, deals, contacts, products, suppliers } = useCrmData();

  return React.useMemo(() => {
    const customerById = buildEntityMap(customers);
    const dealById = buildEntityMap(deals);
    const contactById = buildEntityMap(contacts);
    const productById = buildEntityMap(products);
    const supplierById = buildEntityMap(suppliers);

    const customerNameById = new Map<string, string>();
    for (const customer of customers) {
      customerNameById.set(customer.id, customer.name);
    }

    const customerNameByDealId = new Map<string, string>();
    for (const deal of deals) {
      customerNameByDealId.set(
        deal.id,
        customerNameById.get(deal.customerId) ?? "—"
      );
    }

    return {
      customerById,
      dealById,
      contactById,
      productById,
      supplierById,
      customerNameById,
      customerNameByDealId,
    };
  }, [customers, deals, contacts, products, suppliers]);
}
