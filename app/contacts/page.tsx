import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default function ContactsPage() {
  return (
    <AppShell
      title="Contacts"
      subtitle="Contact directory"
    >
      <AdminGuard>
        <ContactsTable />
      </AdminGuard>
    </AppShell>
  );
}
