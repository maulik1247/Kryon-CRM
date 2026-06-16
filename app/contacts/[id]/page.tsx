import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ContactRecordView } from "@/components/contacts/contact-record-view";

export default function ContactRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Contact">
      <AdminGuard>
        <ContactRecordView contactId={params.id} />
      </AdminGuard>
    </AppShell>
  );
}
