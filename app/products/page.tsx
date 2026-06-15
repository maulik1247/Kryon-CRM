import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductsTable } from "@/components/products/products-table";

export default function ProductsPage() {
  return (
    <AppShell
      title="Products"
      subtitle="Kryon motor controller catalog"
    >
      <AdminGuard>
        <ProductsTable />
      </AdminGuard>
    </AppShell>
  );
}
