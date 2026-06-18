import { formatDealProductsSummary } from "@/lib/deal-form-helpers";
import type { Customer, Deal, DealTask, Product, Supplier } from "@/lib/types";

export interface DealCardDisplay {
  customerName: string;
  productsSummary: string;
  supplierSuffix: string;
  nextTask: { title: string; dueDate: string } | null;
}

export function buildDealCardDisplay(
  deal: Deal,
  {
    getCustomerById,
    getProductById,
    getSupplierById,
    nextTaskByDealId,
  }: {
    getCustomerById: (id: string) => Customer | undefined;
    getProductById: (id: string) => Product | undefined;
    getSupplierById: (id: string) => Supplier | undefined;
    nextTaskByDealId: Map<string, DealTask>;
  }
): DealCardDisplay {
  const customer = getCustomerById(deal.customerId);
  const productsSummary = formatDealProductsSummary(
    deal.lineItems,
    getProductById
  );
  const primarySupplier = deal.lineItems[0]
    ? getSupplierById(deal.lineItems[0].currentSupplierId)
    : undefined;
  const multipleSuppliers =
    new Set(deal.lineItems.map((item) => item.currentSupplierId)).size > 1;
  const nextTask = nextTaskByDealId.get(deal.id);

  let supplierSuffix = "";
  if (primarySupplier) {
    supplierSuffix = multipleSuppliers
      ? " · multiple suppliers"
      : ` · vs ${primarySupplier.name}`;
  }

  return {
    customerName: customer?.name ?? "Unknown customer",
    productsSummary,
    supplierSuffix,
    nextTask: nextTask
      ? { title: nextTask.title, dueDate: nextTask.dueDate }
      : null,
  };
}

export function buildDealCardDisplayMap(
  deals: Deal[],
  helpers: {
    getCustomerById: (id: string) => Customer | undefined;
    getProductById: (id: string) => Product | undefined;
    getSupplierById: (id: string) => Supplier | undefined;
    nextTaskByDealId: Map<string, DealTask>;
  }
) {
  const map = new Map<string, DealCardDisplay>();
  for (const deal of deals) {
    map.set(deal.id, buildDealCardDisplay(deal, helpers));
  }
  return map;
}
