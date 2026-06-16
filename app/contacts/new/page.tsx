import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  return (
    <AppShell title="Add Contact">
      <AdminGuard>
        <ContactForm />
      </AdminGuard>
    </AppShell>
  );
}
