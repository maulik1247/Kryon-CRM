import { AppShell } from "@/components/layout/app-shell";
import { DocumentExchangeForm } from "@/components/document-exchange/document-exchange-form";

export default function NewDocumentPage() {
  return (
    <AppShell title="Add Document">
      <DocumentExchangeForm />
    </AppShell>
  );
}
