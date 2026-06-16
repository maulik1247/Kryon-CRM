import { AppShell } from "@/components/layout/app-shell";
import { TaskRecordView } from "@/components/tasks/task-record-view";

export default function TaskRecordPage({ params }: { params: { id: string } }) {
  return (
    <AppShell title="Edit Task">
      <TaskRecordView taskId={params.id} />
    </AppShell>
  );
}
