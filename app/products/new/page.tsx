import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <AppShell title="Add Product">
      <AdminGuard>
        <ProductForm />
      </AdminGuard>
    </AppShell>
  );
}
