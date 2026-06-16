import { AppShell } from "@/components/layout/app-shell";
import { DealForm } from "@/components/deals/deal-form";

export default function NewDealPage() {
  return (
    <AppShell title="Create Deal">
      <DealForm />
    </AppShell>
  );
}
