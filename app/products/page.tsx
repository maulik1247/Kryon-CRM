import { AppShell } from "@/components/layout/app-shell";
import { ProductsTable } from "@/components/products/products-table";

export default function ProductsPage() {
  return (
    <AppShell
      title="Products"
      subtitle="Kryon motor controller catalog"
    >
      <ProductsTable />
    </AppShell>
  );
}
