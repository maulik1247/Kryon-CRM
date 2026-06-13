"use client";

import * as React from "react";
import { Plus, Trash2, Upload } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
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

function formToProduct(form: ProductFormState, id: string): Product {
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
  };
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
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
  const { addProduct, updateProduct, getProductById } = useCrmData();

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

  const handleSpecSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.pdf$/i.test(file.name)) {
      return;
    }

    update("specSheet", {
      id: `spec-${Date.now()}`,
      name: file.name,
      size: file.size,
    });
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hsn = normalizeHsnCode(form.hsnCode);
    if (!isValidHsnCode(hsn)) {
      setHsnError("Enter a valid 8-digit HSN code.");
      return;
    }

    if (isAdd) {
      addProduct(formToProduct({ ...form, hsnCode: hsn }, `prod-${Date.now()}`));
    } else if (product) {
      updateProduct(
        product.id,
        formToProduct({ ...form, hsnCode: hsn }, product.id)
      );
    }

    onOpenChange(false);
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
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <FormSection title="Product Record">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Product SKU / Part Number" htmlFor="sku">
                  <Input
                    id="sku"
                    required
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Model Name" htmlFor="model">
                  <Input
                    id="model"
                    required
                    value={form.model}
                    onChange={(e) => update("model", e.target.value)}
                  />
                </FormField>
              </div>
              <FormField
                label="Motor / Controller Type"
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

            <Separator />

            <FormSection title="Technical Specifications">
              <div className="grid gap-4 sm:grid-cols-2">
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
                <FormField label="Number of Poles" htmlFor="poles">
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
                <FormField label="Sensor Type" htmlFor="sensorType">
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
              </div>
            </FormSection>

            <Separator />

            <FormSection title="Commercial & Documentation">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="HSN Code" htmlFor="hsnCode">
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
                  label="Current Selling Price (INR)"
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
              </div>
              <FormField label="Product Description" htmlFor="description">
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Application notes, key features, platform fit..."
                />
              </FormField>
              <div className="space-y-2">
                <Label htmlFor="specSheet">Spec Sheet / Drawing</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="specSheet" className="cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload PDF
                    </label>
                  </Button>
                  <Input
                    id="specSheet"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleSpecSheetChange}
                  />
                  <span className="text-xs text-muted-foreground">
                    PDF only — optional
                  </span>
                </div>
                {form.specSheet ? (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="truncate">{form.specSheet.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => update("specSheet", undefined)}
                      aria-label={`Remove ${form.specSheet.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </FormSection>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">
              {isAdd ? "Save Product" : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
