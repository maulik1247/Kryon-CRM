"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteRecordButton } from "@/components/shared/delete-record-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { FormSection, FormSections } from "@/components/shared/form-section";
import { DocumentFilesEditor } from "@/components/shared/document-files-editor";
import { RecordFormPage } from "@/components/records/record-form-page";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes, recordRoutes } from "@/lib/record-routes";
import { navigateAfterSave } from "@/lib/navigate-after-save";
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

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addProduct, updateProduct, deleteProduct, getProductById } =
    useCrmData();

  const product = productId ? getProductById(productId) : null;
  const isAdd = !productId;

  const [form, setForm] = React.useState<ProductFormState>(emptyForm);
  const [hsnError, setHsnError] = React.useState("");

  React.useEffect(() => {
    if (product) {
      setForm(productToForm(product));
      setHsnError("");
    }
  }, [product]);

  const update = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "hsnCode") setHsnError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hsn = normalizeHsnCode(form.hsnCode);
    if (!isValidHsnCode(hsn)) {
      setHsnError("Enter a valid 8-digit HSN code.");
      return;
    }

    if (isAdd) {
      const id = `prod-${Date.now()}`;
      addProduct(
        formToProduct(
          { ...form, hsnCode: hsn },
          id,
          undefined,
          currentUser.id
        )
      );
      navigateAfterSave(router, recordRoutes.product(id));
      return;
    }

    if (!product) return;
    updateProduct(
      product.id,
      formToProduct({ ...form, hsnCode: hsn }, product.id, product)
    );
    navigateAfterSave(router, recordListRoutes.product);
  };

  const handleDelete = () => {
    if (!product) return;
    const removed = deleteProduct(product.id);
    if (removed) router.push(recordListRoutes.product);
  };

  if (!isAdd && !product) {
    return null;
  }

  return (
    <RecordFormPage
      backHref={recordListRoutes.product}
      backLabel="Products"
      title={isAdd ? "Add Product" : "Edit Product"}
      description={
        isAdd
          ? "Kryon product catalog — linked to quotes, PFI, and PO modules."
          : "Update product details in the catalog."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          {!isAdd ? (
            <DeleteRecordButton
              title="Delete product?"
              description={`This will permanently remove ${product?.sku ?? "this product"}.`}
              onConfirm={handleDelete}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.product}>Cancel</Link>
            </Button>
            <Button type="submit">
              {isAdd ? "Save Product" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      <FormSections>
        <FormSection title="Identity">
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

        <FormSection title="Specs">
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

        <FormSection title="Commercial">
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
          <FormField label="Selling price (INR)" htmlFor="sellingPrice">
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
                ? [{ id: form.specSheet.id, name: form.specSheet.name }]
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
      </FormSections>
    </RecordFormPage>
  );
}
