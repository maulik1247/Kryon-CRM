import type {
  Contact,
  Customer,
  DealLineItem,
  MotorControllerType,
  Product,
  Supplier,
} from "@/lib/types";

export const NEW_DEAL_SKU_OPTION = "__new_sku__";

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

export function getSupplierSelectOptions(suppliers: Supplier[]) {
  return [...suppliers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((supplier) => ({
      value: supplier.id,
      label: `${supplier.name} · ${supplier.type}`,
    }));
}

export function suggestSupplierFromCustomerProduct(
  customer: Customer | undefined,
  productId: string
): { supplierId: string; price: number } | null {
  if (!customer || !productId) return null;

  const customerProduct = customer.customerProducts.find(
    (entry) => entry.productId === productId
  );
  if (!customerProduct) return null;

  return {
    supplierId: customerProduct.primarySupplier.supplierId,
    price:
      customerProduct.currentPurchasePrice ||
      customerProduct.primarySupplier.purchasePrice ||
      0,
  };
}

export function getSupplierPriceForCustomerProduct(
  customer: Customer | undefined,
  productId: string,
  supplierId: string
): number | null {
  if (!customer || !productId || !supplierId) return null;

  const customerProduct = customer.customerProducts.find(
    (entry) => entry.productId === productId
  );
  if (!customerProduct) return null;

  if (customerProduct.primarySupplier.supplierId === supplierId) {
    return (
      customerProduct.currentPurchasePrice ||
      customerProduct.primarySupplier.purchasePrice ||
      null
    );
  }

  if (customerProduct.secondarySupplier?.supplierId === supplierId) {
    return customerProduct.secondarySupplier.purchasePrice || null;
  }

  return null;
}

export function defaultSupplierPriceFromProduct(product?: Product): string {
  if (!product) return "";
  return String(Math.round(product.sellingPrice * 1.12));
}

export function calculateDealEstimatedValue(lineItems: DealLineItem[]): number {
  return lineItems.reduce(
    (sum, item) => sum + item.quantity * item.quotedPrice,
    0
  );
}

export function createDealLineItem(
  product: Product | undefined,
  suppliers: Supplier[],
  customer?: Customer,
  overrides?: Partial<DealLineItem>
): DealLineItem {
  const suggestion =
    product && customer
      ? suggestSupplierFromCustomerProduct(customer, product.id)
      : null;

  return {
    id: `dli-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productCategory: product?.motorControllerType ?? overrides?.productCategory ?? "",
    productId: product?.id ?? "",
    quantity: 0,
    quotedPrice: product?.sellingPrice ?? 0,
    currentSupplierId: suggestion?.supplierId ?? suppliers[0]?.id ?? "",
    currentSupplierPrice:
      suggestion?.price ??
      (product ? Math.round(product.sellingPrice * 1.12) : 0),
    ...overrides,
  };
}

export function isCustomDealLineItem(item: DealLineItem): boolean {
  return !item.productId && item.customSku !== undefined;
}

export function getDealLineItemLabel(
  item: DealLineItem,
  getProductById: (productId: string) => Product | undefined
): string {
  if (item.productId) {
    const product = getProductById(item.productId);
    if (product) return `${product.sku} — ${product.model}`;
  }

  const sku = item.customSku?.trim();
  if (!sku) return "—";
  const model = item.customModel?.trim();
  return model ? `${sku} — ${model}` : sku;
}

export function createProductFromDealLine(
  item: DealLineItem,
  createdByUserId: string
): Product {
  const sku = item.customSku!.trim();
  const model = item.customModel?.trim() || sku;

  return {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sku,
    model,
    motorControllerType: (item.productCategory || "Other") as MotorControllerType,
    voltage: 230,
    wattage: 0,
    poles: 4,
    sensorType: "Other",
    hsnCode: "85044090",
    sellingPrice: item.quotedPrice || 0,
    description: "Added from deal pipeline",
    createdAt: new Date().toISOString(),
    createdByUserId,
  };
}

export function resolveDealLineItemsToProducts(
  lineItems: DealLineItem[],
  products: Product[],
  addProduct: (product: Product) => void,
  createdByUserId: string
): DealLineItem[] {
  const skuIndex = new Map(
    products.map((product) => [product.sku.trim().toLowerCase(), product])
  );

  return lineItems.map((item) => {
    if (item.productId) {
      return {
        ...item,
        customSku: undefined,
        customModel: undefined,
      };
    }

    const sku = item.customSku?.trim();
    if (!sku) return item;

    const existing = skuIndex.get(sku.toLowerCase());
    if (existing) {
      return {
        ...item,
        productId: existing.id,
        customSku: undefined,
        customModel: undefined,
      };
    }

    const newProduct = createProductFromDealLine(item, createdByUserId);
    addProduct(newProduct);
    skuIndex.set(sku.toLowerCase(), newProduct);

    return {
      ...item,
      productId: newProduct.id,
      customSku: undefined,
      customModel: undefined,
    };
  });
}
export function formatDealProductsSummary(
  lineItems: DealLineItem[],
  getProductById: (productId: string) => Product | undefined
): string {
  const labels = lineItems
    .map((item) => {
      if (item.productId) {
        const product = getProductById(item.productId);
        return product?.model ?? product?.sku;
      }
      return item.customModel?.trim() || item.customSku?.trim();
    })
    .filter(Boolean) as string[];

  if (labels.length === 0) return "—";
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} + ${labels[1]}`;
  return `${labels[0]} + ${labels.length - 1} more`;
}

export function isValidDealLineItems(lineItems: DealLineItem[]): boolean {
  return (
    lineItems.length > 0 &&
    lineItems.every((item) => {
      const hasProduct =
        Boolean(item.productId) || Boolean(item.customSku?.trim());

      return (
        item.productCategory &&
        hasProduct &&
        item.currentSupplierId &&
        item.quantity > 0 &&
        item.quotedPrice > 0 &&
        item.currentSupplierPrice > 0
      );
    })
  );
}
