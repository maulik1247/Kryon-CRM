"use client";

import { TableActions } from "@/components/shared/table-actions";
import { TaskStatusBadge } from "@/components/shared/task-status-badge";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { TaskExpandedDetails } from "./task-expanded-details";
import type { DealTask, TaskStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface TasksMobileListProps {
  tasks: DealTask[];
  customerNameByDealId: (dealId: string) => string | undefined;
  addedByName: (userId: string) => string;
  assignedToName: (userId: string) => string;
  isOverdue: (task: DealTask) => boolean;
  onOpenTask: (taskId: string) => void;
  onOpenDeal?: (dealId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (task: DealTask) => void;
  showActions?: boolean;
  showStatusSelect?: boolean;
}

export function TasksMobileList({
  tasks,
  customerNameByDealId,
  addedByName,
  assignedToName,
  isOverdue,
  onOpenTask,
  onStatusChange,
  onDelete,
  showActions = true,
  showStatusSelect = true,
}: TasksMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {tasks.map((task) => {
        const overdue = isOverdue(task);

        return (
          <ExpandableMobileCard
            key={task.id}
            id={task.id}
            expandedId={expandedId}
            onToggle={toggleExpanded}
            summary={
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "font-medium leading-snug",
                      task.status === "completed" && "text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className={cn(overdue && "font-medium text-destructive")}>
                    Do by {formatDate(task.dueDate)}
                  </span>
                  <span>·</span>
                  <span className="truncate">
                    {customerNameByDealId(task.dealId) ?? task.dealId}
                  </span>
                </div>
              </div>
            }
            details={
              <TaskExpandedDetails
                task={task}
                customerName={customerNameByDealId(task.dealId)}
                addedByName={addedByName(task.createdByUserId)}
                assignedToName={assignedToName(task.assignedToUserId)}
                isOverdue={overdue}
                onStatusChange={
                  onStatusChange
                    ? (status) => onStatusChange(task.id, status)
                    : undefined
                }
                showStatusSelect={showStatusSelect}
              />
            }
            actions={
              showActions ? (
                <TableActions
                  onEdit={() => onOpenTask(task.id)}
                  onDelete={
                    onDelete ? () => onDelete(task) : () => onOpenTask(task.id)
                  }
                />
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}
