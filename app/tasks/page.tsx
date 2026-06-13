import { AppShell } from "@/components/layout/app-shell";
import { TasksView } from "@/components/tasks/tasks-view";

export default function TasksPage() {
  return (
    <AppShell title="Tasks">
      <TasksView />
    </AppShell>
  );
}
