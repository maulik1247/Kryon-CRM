"use client";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useCrmData } from "@/lib/crm-data-provider";
import { recordListRoutes } from "@/lib/record-routes";

export function SupplierRecordView({ supplierId }: { supplierId: string }) {
  const { getSupplierById } = useCrmData();
  const supplier = getSupplierById(supplierId);

  if (!supplier) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.supplier}
        backLabel="suppliers"
      />
    );
  }

  return <SupplierForm supplierId={supplierId} />;
}
