"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { UserAssigneeSelect } from "@/components/shared/user-assignee-select";
import { canAssignDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { TASK_STATUS_OPTIONS } from "@/lib/task-constants";
import { getUserName, filterDealsForUser, canUserAccessTask } from "@/lib/user-helpers";
import type { DealTask, TaskStatus } from "@/lib/types";

interface TaskSheetProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDeal?: (dealId: string) => void;
}

interface TaskFormState {
  title: string;
  dueDate: string;
  status: TaskStatus;
  dealId: string;
  assignedToUserId: string;
}

function taskToForm(task: DealTask): TaskFormState {
  return {
    title: task.title,
    dueDate: task.dueDate,
    status: task.status,
    dealId: task.dealId,
    assignedToUserId: task.assignedToUserId,
  };
}

export function TaskSheet({
  taskId,
  open,
  onOpenChange,
  onViewDeal,
}: TaskSheetProps) {
  const { currentUser, users } = useAuth();
  const canAssign = canAssignDeals(currentUser.role);
  const {
    dealTasks,
    deals,
    updateDealTask,
    deleteDealTask,
    getCustomerById,
    getDealById,
  } = useCrmData();

  const task = taskId
    ? dealTasks.find((entry) => entry.id === taskId)
    : undefined;

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const hasAccess =
    !task || canUserAccessTask(task, currentUser, users, deals);

  React.useEffect(() => {
    if (open && task && !hasAccess) {
      onOpenChange(false);
    }
  }, [open, task, hasAccess, onOpenChange]);

  const [form, setForm] = React.useState<TaskFormState>({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    dealId: "",
    assignedToUserId: currentUser.id,
  });

  React.useEffect(() => {
    if (open && task) {
      setForm(taskToForm(task));
    }
  }, [open, task]);

  const update = <K extends keyof TaskFormState>(
    field: K,
    value: TaskFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const deal = getDealById(form.dealId);
  const customer = deal ? getCustomerById(deal.customerId) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !form.title.trim() || !form.dealId) return;

    updateDealTask(task.id, {
      title: form.title.trim(),
      dueDate: form.dueDate,
      status: form.status,
      dealId: form.dealId,
      assignedToUserId: canAssign ? form.assignedToUserId : task.assignedToUserId,
      assignerName: currentUser.name,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!task) return;
    deleteDealTask(task.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {task?.title ?? "Task"}
          </SheetTitle>
          <SheetDescription>
            {customer?.name ?? "Customer"} · {form.dealId || "—"}
          </SheetDescription>
        </SheetHeader>

        {task && hasAccess ? (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <FormField label="What to do" htmlFor="task-title">
                <Input
                  id="task-title"
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </FormField>

              <FormField label="Status" htmlFor="task-status">
                <FormSelect
                  id="task-status"
                  value={form.status}
                  onValueChange={(value) =>
                    update("status", value as TaskStatus)
                  }
                  options={TASK_STATUS_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </FormField>

              <FormField label="Do by" htmlFor="task-due-date">
                <DatePicker
                  value={form.dueDate}
                  onChange={(value) => update("dueDate", value)}
                  placeholder="Due date"
                />
              </FormField>

              <FormField label="Deal" htmlFor="task-deal">
                <FormSelect
                  id="task-deal"
                  value={form.dealId}
                  onValueChange={(value) => update("dealId", value)}
                  disabled={visibleDeals.length === 0}
                  placeholder="Select deal"
                  options={visibleDeals.map((entry) => {
                    const dealCustomer = getCustomerById(entry.customerId);
                    return {
                      value: entry.id,
                      label: `${dealCustomer?.name ?? "Unknown"} · ${entry.id}`,
                    };
                  })}
                />
              </FormField>

              {onViewDeal && form.dealId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onViewDeal(form.dealId)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View linked deal
                </Button>
              ) : null}

              <FormField label="Added by" htmlFor="task-created-by">
                <p
                  id="task-created-by"
                  className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                >
                  {getUserName(users, task.createdByUserId)}
                </p>
              </FormField>

              <UserAssigneeSelect
                id="task-assignee"
                label="Assigned to"
                value={form.assignedToUserId}
                onValueChange={(value) => update("assignedToUserId", value)}
                adminOnly
              />
            </div>

            <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={!form.title.trim() || !form.dealId}>
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
