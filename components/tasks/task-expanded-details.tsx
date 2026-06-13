import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailGrid } from "@/components/shared/detail-grid";
import { TaskStatusBadge } from "@/components/shared/task-status-badge";
import { TASK_STATUS_OPTIONS } from "@/lib/task-constants";
import type { DealTask, TaskStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface TaskExpandedDetailsProps {
  task: DealTask;
  customerName?: string;
  addedByName: string;
  assignedToName: string;
  isOverdue: boolean;
  onStatusChange?: (status: TaskStatus) => void;
  showStatusSelect?: boolean;
}

export function TaskExpandedDetails({
  task,
  customerName,
  addedByName,
  assignedToName,
  isOverdue,
  onStatusChange,
  showStatusSelect = true,
}: TaskExpandedDetailsProps) {
  return (
    <div className="space-y-4">
      <DetailGrid
        items={[
          { label: "Customer", value: customerName },
          { label: "Deal", value: task.dealId, mono: true },
          {
            label: "Do by",
            value: formatDate(task.dueDate),
            emphasis: isOverdue,
            className: isOverdue ? "text-destructive" : undefined,
          },
          { label: "Added by", value: addedByName },
          { label: "Assigned to", value: assignedToName },
          {
            label: "Status",
            children: showStatusSelect && onStatusChange ? (
              <Select
                value={task.status}
                onValueChange={(value) =>
                  onStatusChange(value as TaskStatus)
                }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <TaskStatusBadge status={task.status} />
            ),
            className: "col-span-2",
          },
        ]}
      />
      {isOverdue ? (
        <p className={cn("text-xs font-medium text-destructive")}>Overdue</p>
      ) : null}
    </div>
  );
}
