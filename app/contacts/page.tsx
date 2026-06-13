import { AppShell } from "@/components/layout/app-shell";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default function ContactsPage() {
  return (
    <AppShell
      title="Contacts"
      subtitle="Contact directory"
    >
      <ContactsTable />
    </AppShell>
  );
}
