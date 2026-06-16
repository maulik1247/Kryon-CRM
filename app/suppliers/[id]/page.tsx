import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { SupplierRecordView } from "@/components/suppliers/supplier-record-view";

export default function SupplierRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Supplier">
      <AdminGuard>
        <SupplierRecordView supplierId={params.id} />
      </AdminGuard>
    </AppShell>
  );
}
