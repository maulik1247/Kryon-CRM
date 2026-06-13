import type { TaskStatus } from "./types";
import type { BadgeVariant } from "./badge-variants";

export const TASK_STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export const TASK_STATUS_VARIANT: Record<TaskStatus, BadgeVariant> = {
  pending: "secondary",
  in_progress: "default",
  completed: "outline",
};

export function getTaskStatusLabel(status: TaskStatus) {
  return (
    TASK_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function isTaskOpen(status: TaskStatus) {
  return status !== "completed";
}
