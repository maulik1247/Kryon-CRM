import { Badge } from "@/components/ui/badge";
import {
  getTaskStatusLabel,
  TASK_STATUS_VARIANT,
} from "@/lib/task-constants";
import type { TaskStatus } from "@/lib/types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={TASK_STATUS_VARIANT[status]} className="text-xs">
      {getTaskStatusLabel(status)}
    </Badge>
  );
}
