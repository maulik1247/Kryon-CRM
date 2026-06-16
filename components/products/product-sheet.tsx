"use client";

import * as React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { FormSection } from "@/components/shared/form-section";
import { DocumentFilesEditor } from "@/components/shared/document-files-editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  isValidHsnCode,
  MOTOR_CONTROLLER_TYPES,
  MOTOR_POLE_COUNTS,
  normalizeHsnCode,
  SENSOR_TYPES,
} from "@/lib/product-constants";
import type {
  MotorControllerType,
  MotorPoleCount,
  Product,
  ProductSpecDocument,
  SensorType,
} from "@/lib/types";

interface ProductFormState {
  sku: string;
  model: string;
  motorControllerType: MotorControllerType;
  voltage: string;
  wattage: string;
  poles: MotorPoleCount;
  sensorType: SensorType;
  hsnCode: string;
  sellingPrice: string;
  description: string;
  specSheet?: ProductSpecDocument;
}

const emptyForm: ProductFormState = {
  sku: "",
  model: "",
  motorControllerType: "BLDC Indoor",
  voltage: "",
  wattage: "",
  poles: 4,
  sensorType: "Hall Sensor (3-wire)",
  hsnCode: "",
  sellingPrice: "",
  description: "",
};

function productToForm(product: Product): ProductFormState {
  return {
    sku: product.sku,
    model: product.model,
    motorControllerType: product.motorControllerType,
    voltage: String(product.voltage),
    wattage: String(product.wattage),
    poles: product.poles,
    sensorType: product.sensorType,
    hsnCode: product.hsnCode,
    sellingPrice: String(product.sellingPrice),
    description: product.description ?? "",
    specSheet: product.specSheet,
  };
}

function formToProduct(
  form: ProductFormState,
  id: string,
  existing?: Product,
  createdByUserId?: string
): Product {
  return {
    id,
    sku: form.sku.trim(),
    model: form.model.trim(),
    motorControllerType: form.motorControllerType,
    voltage: Number(form.voltage),
    wattage: Number(form.wattage),
    poles: form.poles,
    sensorType: form.sensorType,
    hsnCode: normalizeHsnCode(form.hsnCode),
    sellingPrice: Number(form.sellingPrice),
    description: form.description.trim() || undefined,
    specSheet: form.specSheet,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdByUserId:
      existing?.createdByUserId ?? createdByUserId ?? "user-admin",
  };
}

interface ProductSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductSheet({
  product: productProp,
  open,
  onOpenChange,
}: ProductSheetProps) {
  const { currentUser } = useAuth();
  const { addProduct, updateProduct, deleteProduct, getProductById } = useCrmData();

  const product = productProp
    ? getProductById(productProp.id) ?? productProp
    : null;
  const isAdd = !productProp;
  const [form, setForm] = React.useState<ProductFormState>(emptyForm);
  const [hsnError, setHsnError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setForm(product ? productToForm(product) : emptyForm);
      setHsnError("");
    }
  }, [open, product]);

  const update = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "hsnCode") setHsnError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hsn = normalizeHsnCode(form.hsnCode);
    if (!isValidHsnCode(hsn)) {
      setHsnError("Enter a valid 8-digit HSN code.");
      return;
    }

    if (isAdd) {
      addProduct(
        formToProduct(
          { ...form, hsnCode: hsn },
          `prod-${Date.now()}`,
          undefined,
          currentUser.id
        )
      );
    } else if (product) {
      updateProduct(
        product.id,
        formToProduct({ ...form, hsnCode: hsn }, product.id, product)
      );
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!product) return;
    const removed = deleteProduct(product.id);
    if (removed) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {isAdd ? "Add Product" : product?.model ?? "Product"}
          </SheetTitle>
          <SheetDescription>
            {isAdd
              ? "Kryon product catalog — linked to quotes, PFI, and PO modules."
              : product?.sku ?? "Update product details"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="commercial">Commercial</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="Product SKU / part number" htmlFor="sku">
                <Input
                  id="sku"
                  required
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className="font-mono"
                />
              </FormField>
              <FormField label="Model name" htmlFor="model">
                <Input
                  id="model"
                  required
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                />
              </FormField>
              <FormField
                label="Motor / controller type"
                htmlFor="motorControllerType"
              >
                <FormSelect
                  id="motorControllerType"
                  value={form.motorControllerType}
                  onValueChange={(v) =>
                    update("motorControllerType", v as MotorControllerType)
                  }
                  options={MOTOR_CONTROLLER_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </FormField>
            </FormSection>
              </TabsContent>

              <TabsContent value="specs" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="Voltage (V)" htmlFor="voltage">
                  <Input
                    id="voltage"
                    type="number"
                    required
                    min={1}
                    value={form.voltage}
                    onChange={(e) => update("voltage", e.target.value)}
                />
              </FormField>
              <FormField label="Wattage (W)" htmlFor="wattage">
                <Input
                  id="wattage"
                  type="number"
                  required
                  min={1}
                  value={form.wattage}
                  onChange={(e) => update("wattage", e.target.value)}
                />
              </FormField>
              <FormField label="Number of poles" htmlFor="poles">
                <FormSelect
                  id="poles"
                  value={String(form.poles)}
                  onValueChange={(v) =>
                    update(
                      "poles",
                      (v === "Other" ? "Other" : Number(v)) as MotorPoleCount
                    )
                  }
                  options={MOTOR_POLE_COUNTS.map((pole) => ({
                    value: String(pole),
                    label: String(pole),
                  }))}
                />
              </FormField>
              <FormField label="Sensor type" htmlFor="sensorType">
                <FormSelect
                  id="sensorType"
                  value={form.sensorType}
                  onValueChange={(v) => update("sensorType", v as SensorType)}
                  options={SENSOR_TYPES.map((sensor) => ({
                    value: sensor,
                    label: sensor,
                  }))}
                />
              </FormField>
              <FormField label="Product description" htmlFor="description" optional>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Application notes, key features..."
                />
              </FormField>
            </FormSection>
              </TabsContent>

              <TabsContent value="commercial" className="mt-4 space-y-4">
            <FormSection>
              <FormField label="HSN code" htmlFor="hsnCode">
                  <Input
                    id="hsnCode"
                    required
                    inputMode="numeric"
                    maxLength={8}
                    value={form.hsnCode}
                    onChange={(e) =>
                      update("hsnCode", normalizeHsnCode(e.target.value))
                    }
                    className="font-mono"
                    placeholder="85044090"
                  />
                  {hsnError ? (
                    <p className="text-xs text-destructive">{hsnError}</p>
                  ) : null}
                </FormField>
              <FormField
                label="Selling price (INR)"
                htmlFor="sellingPrice"
              >
                <Input
                  id="sellingPrice"
                  type="number"
                  required
                  min={1}
                  value={form.sellingPrice}
                  onChange={(e) => update("sellingPrice", e.target.value)}
                />
              </FormField>
              <DocumentFilesEditor
                inputId="specSheet"
                label="Spec Sheet / Drawing"
                optional
                value={
                  form.specSheet
                    ? [
                        {
                          id: form.specSheet.id,
                          name: form.specSheet.name,
                        },
                      ]
                    : []
                }
                onChange={(files) =>
                  update(
                    "specSheet",
                    files[0]
                      ? { id: files[0].id, name: files[0].name }
                      : undefined
                  )
                }
                multiple={false}
                accept=".pdf"
                helperText="PDF only"
                emptyMessage="No spec sheet uploaded."
              />
            </FormSection>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
            {!isAdd ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">
                {isAdd ? "Save Product" : "Save Changes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
