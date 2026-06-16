"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
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

interface SupplierSheetProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierSheet({
  supplier: supplierProp,
  open,
  onOpenChange,
}: SupplierSheetProps) {
  const { currentUser } = useAuth();
  const { addSupplier, updateSupplier, deleteSupplier, getSupplierById } =
    useCrmData();

  const supplier = supplierProp
    ? getSupplierById(supplierProp.id) ?? supplierProp
    : null;
  const isAdd = !supplierProp;
  const [form, setForm] = React.useState<SupplierFormState>(emptyForm);

  React.useEffect(() => {
    if (open) {
      setForm(supplier ? supplierToForm(supplier) : emptyForm);
    }
  }, [open, supplier]);

  const update = <K extends keyof SupplierFormState>(
    field: K,
    value: SupplierFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdd) {
      addSupplier(
        formToSupplier(form, `supp-${Date.now()}`, undefined, currentUser.id)
      );
    } else if (supplier) {
      updateSupplier(supplier.id, formToSupplier(form, supplier.id, supplier));
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!supplier) return;
    const removed = deleteSupplier(supplier.id);
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
            {isAdd ? "Add Supplier" : supplier?.name ?? "Supplier"}
          </SheetTitle>
          <SheetDescription>
            {isAdd
              ? "Competitor supplier catalog for customer product tracking."
              : "Update supplier details."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
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
                {isAdd ? "Save Supplier" : "Save Changes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
