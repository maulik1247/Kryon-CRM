import { AppShell } from "@/components/layout/app-shell";
import { CustomersTable } from "@/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <AppShell title="Customer Master">
      <CustomersTable />
    </AppShell>
  );
}
