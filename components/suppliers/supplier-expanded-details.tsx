import { DetailGrid } from "@/components/shared/detail-grid";
import type { Supplier } from "@/lib/types";

export function SupplierExpandedDetails({ supplier }: { supplier: Supplier }) {
  return (
    <DetailGrid
      items={[
        { label: "Type", value: supplier.type },
        { label: "Region", value: supplier.region },
        {
          label: "Notes",
          value: supplier.notes,
          className: "col-span-2",
        },
      ]}
    />
  );
}
