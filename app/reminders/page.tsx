import { AppShell } from "@/components/layout/app-shell";
import { RemindersView } from "@/components/reminders/reminders-view";

export default function RemindersPage() {
  return (
    <AppShell title="Reminders">
      <RemindersView />
    </AppShell>
  );
}
