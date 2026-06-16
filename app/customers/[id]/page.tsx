import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { CustomerRecordView } from "@/components/customers/customer-record-view";

export default function CustomerRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Customer">
      <AdminGuard>
        <CustomerRecordView customerId={params.id} />
      </AdminGuard>
    </AppShell>
  );
}
