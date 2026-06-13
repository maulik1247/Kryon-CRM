import { AppShell } from "@/components/layout/app-shell";
import { ActivityLogView } from "@/components/pipeline/activity-log-view";

export default function ActivityLogPage() {
  return (
    <AppShell title="Activity Log">
      <ActivityLogView />
    </AppShell>
  );
}
