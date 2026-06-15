import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";

export default function SuppliersPage() {
  return (
    <AppShell
      title="Suppliers"
      subtitle="Competitor supplier master"
    >
      <AdminGuard>
        <SuppliersTable />
      </AdminGuard>
    </AppShell>
  );
}
