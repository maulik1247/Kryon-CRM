import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <AppShell title="Add Customer">
      <AdminGuard>
        <CustomerForm />
      </AdminGuard>
    </AppShell>
  );
}
