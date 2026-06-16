import { AppShell } from "@/components/layout/app-shell";
import { DealRecordView } from "@/components/deals/deal-record-view";

export default function DealRecordPage({ params }: { params: { id: string } }) {
  return (
    <AppShell title="Edit Deal">
      <DealRecordView dealId={params.id} />
    </AppShell>
  );
}
