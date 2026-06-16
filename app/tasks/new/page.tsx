import { AppShell } from "@/components/layout/app-shell";
import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <AppShell title="Add Task">
      <TaskForm />
    </AppShell>
  );
}
