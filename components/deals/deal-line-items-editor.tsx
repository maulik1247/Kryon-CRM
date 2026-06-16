"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { InfoTip } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import {
  calculatePriceAdvantage,
  createDealLineItem,
  getProductsForCategory,
  getSupplierPriceForCustomerProduct,
  getSupplierSelectOptions,
  isCustomDealLineItem,
  NEW_DEAL_SKU_OPTION,
  suggestSupplierFromCustomerProduct,
} from "@/lib/deal-form-helpers";
import type { Customer, DealLineItem, Product, Supplier } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DealLineItemsEditorProps {
  items: DealLineItem[];
  onChange: (items: DealLineItem[]) => void;
  customer?: Customer;
  products: Product[];
  suppliers: Supplier[];
  categoryOptions: { value: string; label: string }[];
  getProductById: (productId: string) => Product | undefined;
}

function productOptions(
  products: Product[],
  productCategory: string,
  usedProductIds: string[],
  currentProductId: string
) {
  const filtered = getProductsForCategory(products, productCategory);

  return filtered
    .filter(
      (product) =>
        product.id === currentProductId || !usedProductIds.includes(product.id)
    )
    .map((product) => ({
      value: product.id,
      label: `${product.sku} — ${product.model}`,
    }));
}

function firstAvailableProduct(
  products: Product[],
  usedProductIds: string[],
  preferredCategory?: string
) {
  if (preferredCategory) {
    const inCategory = getProductsForCategory(products, preferredCategory).find(
      (product) => !usedProductIds.includes(product.id)
    );
    if (inCategory) return inCategory;
  }

  return products.find((product) => !usedProductIds.includes(product.id));
}

function showCustomSkuFields(
  item: DealLineItem,
  catalogOptions: { value: string; label: string }[]
) {
  return (
    isCustomDealLineItem(item) ||
    (Boolean(item.productCategory) && catalogOptions.length === 0)
  );
}

export function DealLineItemsEditor({
  items,
  onChange,
  customer,
  products,
  suppliers,
  categoryOptions,
  getProductById,
}: DealLineItemsEditorProps) {
  const supplierOptions = getSupplierSelectOptions(suppliers);
  const usedProductIds = items.map((item) => item.productId).filter(Boolean);

  const updateItem = (itemId: string, updates: Partial<DealLineItem>) => {
    onChange(
      items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleProductChange = (itemId: string, productId: string) => {
    if (productId === NEW_DEAL_SKU_OPTION) {
      updateItem(itemId, {
        productId: "",
        customSku: "",
        customModel: "",
      });
      return;
    }

    const product = getProductById(productId);
    const suggestion = suggestSupplierFromCustomerProduct(customer, productId);

    updateItem(itemId, {
      productId,
      productCategory: product?.motorControllerType ?? "",
      customSku: undefined,
      customModel: undefined,
      quotedPrice: product?.sellingPrice ?? 0,
      currentSupplierId: suggestion?.supplierId ?? suppliers[0]?.id ?? "",
      currentSupplierPrice:
        suggestion?.price ??
        (product ? Math.round(product.sellingPrice * 1.12) : 0),
    });
  };

  const handleCategoryChange = (itemId: string, productCategory: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;

    const usedExceptCurrent = items
      .filter((entry) => entry.id !== itemId)
      .map((entry) => entry.productId)
      .filter(Boolean);

    const nextProduct = firstAvailableProduct(
      products,
      usedExceptCurrent,
      productCategory
    );

    if (!nextProduct) {
      updateItem(itemId, {
        productCategory,
        productId: "",
        customSku: "",
        customModel: "",
      });
      return;
    }

    const suggestion = suggestSupplierFromCustomerProduct(
      customer,
      nextProduct.id
    );

    updateItem(itemId, {
      productCategory,
      productId: nextProduct.id,
      customSku: undefined,
      customModel: undefined,
      quotedPrice: nextProduct.sellingPrice,
      currentSupplierId: suggestion?.supplierId ?? suppliers[0]?.id ?? "",
      currentSupplierPrice:
        suggestion?.price ?? Math.round(nextProduct.sellingPrice * 1.12),
    });
  };

  const handleSupplierChange = (itemId: string, supplierId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;

    const priceHint = getSupplierPriceForCustomerProduct(
      customer,
      item.productId,
      supplierId
    );

    updateItem(itemId, {
      currentSupplierId: supplierId,
      currentSupplierPrice: priceHint ?? item.currentSupplierPrice,
    });
  };

  const addLine = () => {
    const usedCategories = new Set(
      items.map((item) => item.productCategory).filter(Boolean)
    );
    const preferredCategory = categoryOptions.find(
      (option) => !usedCategories.has(option.value)
    )?.value;

    const available = firstAvailableProduct(
      products,
      usedProductIds,
      preferredCategory
    );
    const productCategory =
      available?.motorControllerType ?? preferredCategory ?? "";

    if (!available) {
      onChange([
        ...items,
        createDealLineItem(undefined, suppliers, customer, {
          productCategory,
          customSku: "",
          customModel: "",
        }),
      ]);
      return;
    }

    onChange([
      ...items,
      createDealLineItem(available, suppliers, customer, {
        productCategory,
      }),
    ]);
  };

  const canAddMore = categoryOptions.length > 0;

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add one or more products to this deal. Pick from catalog or enter a new
          SKU if it is not listed yet.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const product = getProductById(item.productId);
        const lineValue = item.quantity * item.quotedPrice;
        const priceAdvantage = calculatePriceAdvantage(
          item.currentSupplierPrice,
          item.quotedPrice
        );
        const catalogOptions = productOptions(
          products,
          item.productCategory,
          usedProductIds,
          item.productId
        );
        const customSkuMode = showCustomSkuFields(item, catalogOptions);
        const skuSelectValue = item.productId
          ? item.productId
          : customSkuMode
            ? NEW_DEAL_SKU_OPTION
            : "";
        const skuOptions = [
          ...catalogOptions,
          ...(item.productCategory
            ? [{ value: NEW_DEAL_SKU_OPTION, label: "Enter new SKU…" }]
            : []),
        ];
        const displaySku =
          product?.sku ?? item.customSku?.trim() ?? "—";

        return (
          <div
            key={item.id}
            className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Product {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onChange(items.filter((entry) => entry.id !== item.id))
                }
                aria-label={`Remove product ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              label="Product category"
              htmlFor={`deal-line-category-${item.id}`}
            >
              <FormSelect
                id={`deal-line-category-${item.id}`}
                value={item.productCategory}
                onValueChange={(value) => handleCategoryChange(item.id, value)}
                disabled={categoryOptions.length === 0}
                placeholder="Select category"
                options={categoryOptions}
              />
            </FormField>

            {item.productCategory ? (
              <>
                {catalogOptions.length > 0 ? (
                  <FormField label="SKU" htmlFor={`deal-line-product-${item.id}`}>
                    <FormSelect
                      id={`deal-line-product-${item.id}`}
                      value={skuSelectValue}
                      onValueChange={(value) =>
                        handleProductChange(item.id, value)
                      }
                      placeholder="Select product"
                      options={skuOptions}
                    />
                  </FormField>
                ) : null}

                {customSkuMode ? (
                  <div className="space-y-4 rounded-md border border-dashed border-border/70 bg-muted/10 p-3">
                    <p className="text-xs text-muted-foreground">
                      {catalogOptions.length === 0
                        ? "No catalog SKU in this category yet. Enter one here — it will be saved to Products when you save the deal."
                        : "New SKU will be added to Products when you save the deal."}
                    </p>
                    <FormField
                      label="SKU / part number"
                      htmlFor={`deal-line-custom-sku-${item.id}`}
                    >
                      <Input
                        id={`deal-line-custom-sku-${item.id}`}
                        value={item.customSku ?? ""}
                        onChange={(e) =>
                          updateItem(item.id, { customSku: e.target.value })
                        }
                        placeholder="e.g. KRN-BLDC-AC-99"
                      />
                    </FormField>
                    <FormField
                      label="Model name"
                      htmlFor={`deal-line-custom-model-${item.id}`}
                      optional
                    >
                      <Input
                        id={`deal-line-custom-model-${item.id}`}
                        value={item.customModel ?? ""}
                        onChange={(e) =>
                          updateItem(item.id, { customModel: e.target.value })
                        }
                        placeholder="Defaults to SKU if left blank"
                      />
                    </FormField>
                  </div>
                ) : null}
              </>
            ) : null}

            <FormField label="Quantity (pcs)" htmlFor={`deal-line-qty-${item.id}`}>
              <Input
                id={`deal-line-qty-${item.id}`}
                type="number"
                min={1}
                value={item.quantity || ""}
                onChange={(e) =>
                  updateItem(item.id, {
                    quantity: Number(e.target.value) || 0,
                  })
                }
                placeholder="e.g. 50000"
              />
            </FormField>

            <FormField
              label="Current supplier"
              htmlFor={`deal-line-supplier-${item.id}`}
            >
              <FormSelect
                id={`deal-line-supplier-${item.id}`}
                value={item.currentSupplierId}
                onValueChange={(value) => handleSupplierChange(item.id, value)}
                disabled={supplierOptions.length === 0}
                placeholder={
                  supplierOptions.length === 0
                    ? "Add suppliers in Suppliers first"
                    : "Select supplier"
                }
                options={supplierOptions}
              />
              {customer &&
              item.productId &&
              suggestSupplierFromCustomerProduct(customer, item.productId) ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Suggested from customer product intelligence.
                </p>
              ) : null}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Supplier price (₹/unit)"
                htmlFor={`deal-line-supplier-price-${item.id}`}
                info={HELP.supplierPrice}
              >
                <Input
                  id={`deal-line-supplier-price-${item.id}`}
                  type="number"
                  min={0}
                  value={item.currentSupplierPrice || ""}
                  onChange={(e) =>
                    updateItem(item.id, {
                      currentSupplierPrice: Number(e.target.value) || 0,
                    })
                  }
                />
              </FormField>
              <FormField
                label="Our quote (₹/unit)"
                htmlFor={`deal-line-quote-${item.id}`}
              >
                <Input
                  id={`deal-line-quote-${item.id}`}
                  type="number"
                  min={0}
                  value={item.quotedPrice || ""}
                  onChange={(e) =>
                    updateItem(item.id, {
                      quotedPrice: Number(e.target.value) || 0,
                    })
                  }
                />
              </FormField>
            </div>

            <div className="grid gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2.5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Line value</p>
                <p className="font-medium tabular-nums">
                  {lineValue > 0 ? formatCurrency(lineValue) : "—"}
                </p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  Price advantage
                  <InfoTip content={HELP.supplierPrice} />
                </p>
                <p className="font-medium tabular-nums">
                  {item.currentSupplierPrice > 0
                    ? `${priceAdvantage.toFixed(1)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="truncate font-medium">{displaySku}</p>
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        disabled={!canAddMore}
      >
        <Plus className="h-4 w-4" />
        Add another product
      </Button>
    </div>
  );
}
