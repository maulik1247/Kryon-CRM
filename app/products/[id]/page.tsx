import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductRecordView } from "@/components/products/product-record-view";

export default function ProductRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Product">
      <AdminGuard>
        <ProductRecordView productId={params.id} />
      </AdminGuard>
    </AppShell>
  );
}
