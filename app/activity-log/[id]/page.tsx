import { AppShell } from "@/components/layout/app-shell";
import { ActivityRecordView } from "@/components/pipeline/activity-record-view";

export default function ActivityRecordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppShell title="Edit Activity">
      <ActivityRecordView activityId={params.id} />
    </AppShell>
  );
}
