import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { SupplierForm } from "@/components/suppliers/supplier-form";

export default function NewSupplierPage() {
  return (
    <AppShell title="Add Supplier">
      <AdminGuard>
        <SupplierForm />
      </AdminGuard>
    </AppShell>
  );
}
