import { AppShell } from "@/components/layout/app-shell";
import { DocumentExchangeRecordView } from "@/components/document-exchange/document-exchange-record-view";

export default function DocumentRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Document">
      <DocumentExchangeRecordView recordId={params.id} />
    </AppShell>
  );
}
