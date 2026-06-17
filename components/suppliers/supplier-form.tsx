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
import { RecordFormPage } from "@/components/records/record-form-page";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes, recordRoutes } from "@/lib/record-routes";
import { navigateAfterSave } from "@/lib/navigate-after-save";
import { SUPPLIER_TYPES } from "@/lib/supplier-constants";
import type { Supplier, SupplierType } from "@/lib/types";

interface SupplierFormState {
  name: string;
  type: SupplierType;
  region: string;
  notes: string;
}

const emptyForm: SupplierFormState = {
  name: "",
  type: "Motor Manufacturer",
  region: "",
  notes: "",
};

function supplierToForm(supplier: Supplier): SupplierFormState {
  return {
    name: supplier.name,
    type: supplier.type,
    region: supplier.region,
    notes: supplier.notes ?? "",
  };
}

function formToSupplier(
  form: SupplierFormState,
  id: string,
  existing?: Supplier,
  createdByUserId?: string
): Supplier {
  return {
    id,
    name: form.name.trim(),
    type: form.type,
    region: form.region.trim(),
    notes: form.notes.trim() || undefined,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdByUserId:
      existing?.createdByUserId ?? createdByUserId ?? "user-admin",
  };
}

interface SupplierFormProps {
  supplierId?: string;
}

export function SupplierForm({ supplierId }: SupplierFormProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSupplier, updateSupplier, deleteSupplier, getSupplierById } =
    useCrmData();

  const supplier = supplierId ? getSupplierById(supplierId) : null;
  const isAdd = !supplierId;

  const [form, setForm] = React.useState<SupplierFormState>(() =>
    supplier ? supplierToForm(supplier) : emptyForm
  );

  React.useEffect(() => {
    if (supplier) {
      setForm(supplierToForm(supplier));
    }
  }, [supplier]);

  const update = <K extends keyof SupplierFormState>(
    field: K,
    value: SupplierFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAdd) {
      const id = `supp-${Date.now()}`;
      addSupplier(
        formToSupplier(form, id, undefined, currentUser.id)
      );
      navigateAfterSave(router, recordRoutes.supplier(id));
      return;
    }

    if (!supplier) return;
    updateSupplier(supplier.id, formToSupplier(form, supplier.id, supplier));
    navigateAfterSave(router, recordListRoutes.supplier);
  };

  const handleDelete = () => {
    if (!supplier) return;
    const removed = deleteSupplier(supplier.id);
    if (removed) router.push(recordListRoutes.supplier);
  };

  if (!isAdd && !supplier) {
    return null;
  }

  return (
    <RecordFormPage
      backHref={recordListRoutes.supplier}
      backLabel="Suppliers"
      title={isAdd ? "Add Supplier" : "Edit Supplier"}
      description={
        isAdd
          ? "Competitor supplier catalog for customer product tracking."
          : "Update supplier details in the catalog."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          {!isAdd ? (
            <DeleteRecordButton
              title="Delete supplier?"
              description={`This will permanently remove ${supplier?.name ?? "this supplier"}.`}
              onConfirm={handleDelete}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.supplier}>Cancel</Link>
            </Button>
            <Button type="submit">
              {isAdd ? "Save Supplier" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      <FormField label="Supplier name" htmlFor="supplier-name">
        <Input
          id="supplier-name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Nidec India"
        />
      </FormField>

      <FormField label="Type" htmlFor="supplier-type">
        <FormSelect
          id="supplier-type"
          value={form.type}
          onValueChange={(value) => update("type", value as SupplierType)}
          options={SUPPLIER_TYPES.map((type) => ({
            value: type,
            label: type,
          }))}
        />
      </FormField>

      <FormField label="Country / region" htmlFor="supplier-region">
        <Input
          id="supplier-region"
          required
          value={form.region}
          onChange={(e) => update("region", e.target.value)}
          placeholder="e.g. India"
        />
      </FormField>

      <FormField label="Notes" htmlFor="supplier-notes" optional>
        <Textarea
          id="supplier-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Market position, platforms served, etc."
        />
      </FormField>
    </RecordFormPage>
  );
}
