"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/shared/form-select";
import { MOTOR_POLE_COUNTS } from "@/lib/product-constants";
import type { CustomerProductDetails, MotorPoleCount } from "@/lib/types";

function createEmptyCustomerProduct(): CustomerProductDetails {
  return {
    id: `cprod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productSkuOrModel: "",
    currentPurchasePrice: 0,
    voltage: 0,
    wattage: 0,
    poles: 4,
    primarySupplier: {
      name: "",
      volume: "",
      purchasePrice: 0,
    },
  };
}

interface CustomerProductDetailsEditorProps {
  value: CustomerProductDetails[];
  onChange: (value: CustomerProductDetails[]) => void;
}

export function CustomerProductDetailsEditor({
  value,
  onChange,
}: CustomerProductDetailsEditorProps) {
  const updateItem = (
    id: string,
    updates: Partial<CustomerProductDetails>
  ) => {
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updatePrimarySupplier = (
    id: string,
    field: keyof CustomerProductDetails["primarySupplier"],
    fieldValue: string
  ) => {
    onChange(
      value.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          primarySupplier: {
            ...item.primarySupplier,
            [field]:
              field === "purchasePrice" ? Number(fieldValue) || 0 : fieldValue,
          },
        };
      })
    );
  };

  const updateSecondarySupplier = (
    id: string,
    field: keyof NonNullable<CustomerProductDetails["secondarySupplier"]>,
    fieldValue: string
  ) => {
    onChange(
      value.map((item) => {
        if (item.id !== id) return item;
        const secondary = item.secondarySupplier ?? {
          name: "",
          volume: "",
          purchasePrice: 0,
        };
        return {
          ...item,
          secondarySupplier: {
            ...secondary,
            [field]:
              field === "purchasePrice" ? Number(fieldValue) || 0 : fieldValue,
          },
        };
      })
    );
  };

  const addItem = () => {
    onChange([...value, createEmptyCustomerProduct()]);
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Customer Product Details</Label>
        <p className="text-xs text-muted-foreground">
          Multiple entries per customer — what they buy today from existing
          suppliers.
        </p>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No customer products added yet.
        </div>
      ) : (
        value.map((item, index) => (
          <Card key={item.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
              <CardTitle className="text-sm font-medium">
                Product {index + 1}
                {item.productSkuOrModel
                  ? ` · ${item.productSkuOrModel}`
                  : ""}
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
                <Label htmlFor={`${item.id}-sku`}>
                  Product SKU / Model Name
                </Label>
                <Input
                  id={`${item.id}-sku`}
                  value={item.productSkuOrModel}
                  onChange={(e) =>
                    updateItem(item.id, {
                      productSkuOrModel: e.target.value,
                    })
                  }
                  placeholder="Customer's current product reference"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.id}-annual-qty`}>
                    Annual Quantity (pcs)
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
                    Monthly Off-take (pcs)
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
                  Current Purchase Price (INR)
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

              <div className="space-y-2">
                <Label>Technical Specs</Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`${item.id}-voltage`}
                      className="text-xs text-muted-foreground"
                    >
                      Voltage (V)
                    </Label>
                    <Input
                      id={`${item.id}-voltage`}
                      type="number"
                      min={0}
                      value={item.voltage || ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          voltage: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`${item.id}-wattage`}
                      className="text-xs text-muted-foreground"
                    >
                      Wattage (W)
                    </Label>
                    <Input
                      id={`${item.id}-wattage`}
                      type="number"
                      min={0}
                      value={item.wattage || ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          wattage: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`${item.id}-poles`}
                      className="text-xs text-muted-foreground"
                    >
                      Poles
                    </Label>
                    <FormSelect
                      id={`${item.id}-poles`}
                      value={String(item.poles)}
                      onValueChange={(v) =>
                        updateItem(item.id, {
                          poles: (v === "Other"
                            ? "Other"
                            : Number(v)) as MotorPoleCount,
                        })
                      }
                      options={MOTOR_POLE_COUNTS.map((pole) => ({
                        value: String(pole),
                        label: String(pole),
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-md border bg-muted/20 p-3">
                <Label>Current Supplier — Primary</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    value={item.primarySupplier.name}
                    onChange={(e) =>
                      updatePrimarySupplier(item.id, "name", e.target.value)
                    }
                    placeholder="Supplier name"
                  />
                  <Input
                    value={item.primarySupplier.volume}
                    onChange={(e) =>
                      updatePrimarySupplier(item.id, "volume", e.target.value)
                    }
                    placeholder="Volumes"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.primarySupplier.purchasePrice || ""}
                    onChange={(e) =>
                      updatePrimarySupplier(
                        item.id,
                        "purchasePrice",
                        e.target.value
                      )
                    }
                    placeholder="Purchase price (INR)"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-dashed p-3">
                <Label>Current Supplier — Secondary (optional)</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    value={item.secondarySupplier?.name ?? ""}
                    onChange={(e) =>
                      updateSecondarySupplier(item.id, "name", e.target.value)
                    }
                    placeholder="Supplier name"
                  />
                  <Input
                    value={item.secondarySupplier?.volume ?? ""}
                    onChange={(e) =>
                      updateSecondarySupplier(item.id, "volume", e.target.value)
                    }
                    placeholder="Volumes"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.secondarySupplier?.purchasePrice ?? ""}
                    onChange={(e) =>
                      updateSecondarySupplier(
                        item.id,
                        "purchasePrice",
                        e.target.value
                      )
                    }
                    placeholder="Purchase price (INR)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4" />
        Add customer product
      </Button>
    </div>
  );
}
