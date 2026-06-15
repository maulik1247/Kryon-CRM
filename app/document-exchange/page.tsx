import { AppShell } from "@/components/layout/app-shell";
import { DocumentExchangeTable } from "@/components/document-exchange/document-exchange-table";

export default function DocumentExchangePage() {
  return (
    <AppShell
      title="Documents"
      subtitle="NDA & document exchange"
    >
      <DocumentExchangeTable />
    </AppShell>
  );
}
