"use client";

import { TaskForm } from "@/components/tasks/task-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { canUserAccessTask } from "@/lib/user-helpers";
import { recordListRoutes } from "@/lib/record-routes";

export function TaskRecordView({ taskId }: { taskId: string }) {
  const { users, currentUser } = useAuth();
  const { dealTasks, deals } = useCrmData();
  const task = dealTasks.find((entry) => entry.id === taskId);

  const hasAccess =
    task && canUserAccessTask(task, currentUser, users, deals);

  if (!task || !hasAccess) {
    return (
      <RecordNotFound backHref={recordListRoutes.task} backLabel="tasks" />
    );
  }

  return <TaskForm taskId={taskId} />;
}
