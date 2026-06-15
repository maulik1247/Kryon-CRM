"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/shared/form-select";
import { useCrmData } from "@/lib/crm-data-provider";
import type {
  CustomerProductDetails,
  CustomerProductSupplier,
  Product,
  Supplier,
} from "@/lib/types";

function emptySupplier(suppliers: Supplier[]): CustomerProductSupplier {
  return {
    supplierId: suppliers[0]?.id ?? "",
    volume: "",
    purchasePrice: 0,
  };
}

function customerProductFromProduct(
  product: Product,
  suppliers: Supplier[]
): CustomerProductDetails {
  return {
    id: `cprod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    productSkuOrModel: `${product.sku} — ${product.model}`,
    currentPurchasePrice: 0,
    voltage: product.voltage,
    wattage: product.wattage,
    poles: product.poles,
    primarySupplier: emptySupplier(suppliers),
  };
}

function formatProductLabel(product: Product) {
  return `${product.sku} — ${product.model}`;
}

function SupplierFields({
  title,
  supplierLink,
  suppliers,
  getSupplierById,
  onChange,
  optional,
  onRemove,
}: {
  title: string;
  supplierLink: CustomerProductSupplier;
  suppliers: Supplier[];
  getSupplierById: (id: string) => Supplier | undefined;
  onChange: (supplierLink: CustomerProductSupplier) => void;
  optional?: boolean;
  onRemove?: () => void;
}) {
  const selectedSupplier = getSupplierById(supplierLink.supplierId);

  const update = (
    field: keyof CustomerProductSupplier,
    value: string
  ) => {
    onChange({
      ...supplierLink,
      [field]: field === "purchasePrice" ? Number(value) || 0 : value,
    });
  };

  return (
    <div className="space-y-2 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label>{title}</Label>
        {optional && onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : null}
      </div>

      {suppliers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add suppliers in Supplier Master first.
        </p>
      ) : (
        <>
          <FormSelect
            value={supplierLink.supplierId}
            onValueChange={(supplierId) => update("supplierId", supplierId)}
            placeholder="Select supplier"
            options={suppliers.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            }))}
          />

          {selectedSupplier ? (
            <p className="text-xs text-muted-foreground">
              {selectedSupplier.type} · {selectedSupplier.region}
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={supplierLink.volume}
              onChange={(e) => update("volume", e.target.value)}
              placeholder="Volumes (e.g. 600k pcs/yr)"
            />
            <Input
              type="number"
              min={0}
              value={supplierLink.purchasePrice || ""}
              onChange={(e) => update("purchasePrice", e.target.value)}
              placeholder="Their price (₹)"
            />
          </div>
        </>
      )}
    </div>
  );
}

interface CustomerProductDetailsEditorProps {
  value: CustomerProductDetails[];
  onChange: (value: CustomerProductDetails[]) => void;
}

export function CustomerProductDetailsEditor({
  value,
  onChange,
}: CustomerProductDetailsEditorProps) {
  const { products, suppliers, getProductById, getSupplierById } = useCrmData();

  const usedProductIds = new Set(
    value.map((item) => item.productId).filter(Boolean)
  );
  const availableProducts = products.filter(
    (product) => !usedProductIds.has(product.id)
  );

  const updateItem = (
    id: string,
    updates: Partial<CustomerProductDetails>
  ) => {
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleProductChange = (itemId: string, productId: string) => {
    const product = getProductById(productId);
    if (!product) return;

    updateItem(itemId, {
      productId: product.id,
      productSkuOrModel: formatProductLabel(product),
      voltage: product.voltage,
      wattage: product.wattage,
      poles: product.poles,
    });
  };

  const addItem = () => {
    const nextProduct = availableProducts[0];
    if (!nextProduct) return;
    onChange([...value, customerProductFromProduct(nextProduct, suppliers)]);
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Kryon products this customer buys today — linked to product and supplier
        masters for like-for-like competitive tracking.
      </p>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Add products in Product Master before linking them here.
        </div>
      ) : value.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No customer product entries yet.
        </div>
      ) : (
        value.map((item, index) => {
          const catalogProduct = getProductById(item.productId);
          const selectableProducts = [
            ...(catalogProduct ? [catalogProduct] : []),
            ...products.filter(
              (product) =>
                product.id === item.productId ||
                !value.some(
                  (entry) =>
                    entry.id !== item.id && entry.productId === product.id
                )
            ),
          ].filter(
            (product, productIndex, list) =>
              list.findIndex((entry) => entry.id === product.id) === productIndex
          );

          return (
            <Card key={item.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
                <CardTitle className="text-sm font-medium">
                  {catalogProduct?.model ?? `Product ${index + 1}`}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove product ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.id}-product`}>
                    Product SKU / Model Name
                  </Label>
                  <FormSelect
                    id={`${item.id}-product`}
                    value={item.productId}
                    onValueChange={(productId) =>
                      handleProductChange(item.id, productId)
                    }
                    placeholder="Select from product master"
                    options={selectableProducts.map((product) => ({
                      value: product.id,
                      label: formatProductLabel(product),
                    }))}
                  />
                </div>

                {catalogProduct ? (
                  <div className="space-y-1.5">
                    <Label>Technical specs</Label>
                    <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
                      <p className="font-medium">
                        {catalogProduct.motorControllerType}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {catalogProduct.voltage} V · {catalogProduct.wattage} W
                        · {catalogProduct.poles} poles
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Kryon selling price ₹
                        {catalogProduct.sellingPrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${item.id}-annual-qty`}>
                      Annual quantity (pcs)
                    </Label>
                    <Input
                      id={`${item.id}-annual-qty`}
                      type="number"
                      min={0}
                      value={item.annualQuantityPcs ?? ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          annualQuantityPcs: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${item.id}-monthly-offtake`}>
                      Monthly off-take (pcs)
                    </Label>
                    <Input
                      id={`${item.id}-monthly-offtake`}
                      type="number"
                      min={0}
                      value={item.monthlyOfftakePcs ?? ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          monthlyOfftakePcs: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${item.id}-purchase-price`}>
                    Current purchase price (INR)
                  </Label>
                  <Input
                    id={`${item.id}-purchase-price`}
                    type="number"
                    min={0}
                    value={item.currentPurchasePrice || ""}
                    onChange={(e) =>
                      updateItem(item.id, {
                        currentPurchasePrice: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <SupplierFields
                  title="Current supplier — primary"
                  supplierLink={item.primarySupplier}
                  suppliers={suppliers}
                  getSupplierById={getSupplierById}
                  onChange={(primarySupplier) =>
                    updateItem(item.id, { primarySupplier })
                  }
                />

                {item.secondarySupplier ? (
                  <SupplierFields
                    title="Current supplier — secondary"
                    supplierLink={item.secondarySupplier}
                    suppliers={suppliers}
                    getSupplierById={getSupplierById}
                    optional
                    onChange={(secondarySupplier) =>
                      updateItem(item.id, { secondarySupplier })
                    }
                    onRemove={() =>
                      updateItem(item.id, { secondarySupplier: undefined })
                    }
                  />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateItem(item.id, {
                        secondarySupplier: emptySupplier(suppliers),
                      })
                    }
                    disabled={suppliers.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Add secondary supplier
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={products.length === 0 || availableProducts.length === 0}
      >
        <Plus className="h-4 w-4" />
        Add product
      </Button>
    </div>
  );
}
