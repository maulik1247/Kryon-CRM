import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { CustomersTable } from "@/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <AppShell title="Customer Master">
      <AdminGuard>
        <CustomersTable />
      </AdminGuard>
    </AppShell>
  );
}
