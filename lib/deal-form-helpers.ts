import type { Contact, Customer, Product } from "@/lib/types";

export function calculatePriceAdvantage(
  currentSupplierPrice: number,
  quotedPrice: number
): number {
  if (currentSupplierPrice <= 0) return 0;
  return ((currentSupplierPrice - quotedPrice) / currentSupplierPrice) * 100;
}

export function getProductsForCategory(
  products: Product[],
  category: string
): Product[] {
  if (!category) return products;
  return products.filter(
    (product) => product.motorControllerType === category
  );
}

export function getCustomerSearchHaystack(
  customer: Customer,
  contacts: Contact[]
): string {
  const phones = contacts
    .filter((contact) => contact.customerId === customer.id)
    .map((contact) => contact.phone)
    .join(" ");
  const cities = customer.plantLocations.join(" ");

  return [customer.name, phones, cities, customer.oemSegment]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterCustomersBySearch(
  customers: Customer[],
  contacts: Contact[],
  query: string
): Customer[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return customers;

  return customers.filter((customer) =>
    getCustomerSearchHaystack(customer, contacts).includes(normalizedQuery)
  );
}

export function suggestSupplierFromCustomerProduct(
  customer: Customer | undefined,
  productId: string,
  getSupplierName: (supplierId: string) => string | undefined
): { name: string; price: number } | null {
  if (!customer || !productId) return null;

  const customerProduct = customer.customerProducts.find(
    (entry) => entry.productId === productId
  );
  if (!customerProduct) return null;

  const supplierName =
    getSupplierName(customerProduct.primarySupplier.supplierId) ?? "";

  return {
    name: supplierName,
    price:
      customerProduct.currentPurchasePrice ||
      customerProduct.primarySupplier.purchasePrice ||
      0,
  };
}
