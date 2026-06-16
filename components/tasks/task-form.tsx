"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import { FormSelect } from "@/components/shared/form-select";
import { UserAssigneeSelect } from "@/components/shared/user-assignee-select";
import { RecordFormPage } from "@/components/records/record-form-page";
import { canAssignDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { TASK_STATUS_OPTIONS } from "@/lib/task-constants";
import {
  filterDealsForUser,
  getUserName,
} from "@/lib/user-helpers";
import { recordListRoutes, recordRoutes } from "@/lib/record-routes";
import type { DealTask, TaskStatus } from "@/lib/types";

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

interface TaskFormProps {
  taskId?: string;
  defaultDealId?: string;
}

export function TaskForm({ taskId, defaultDealId }: TaskFormProps) {
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const canAssign = canAssignDeals(currentUser.role);
  const {
    dealTasks,
    deals,
    addDealTask,
    updateDealTask,
    deleteDealTask,
    getCustomerById,
  } = useCrmData();

  const task = taskId
    ? dealTasks.find((entry) => entry.id === taskId)
    : undefined;
  const isAdd = !taskId;

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = React.useState<TaskFormState>(() =>
    task
      ? taskToForm(task)
      : {
          title: "",
          dueDate: today,
          status: "pending",
          dealId: defaultDealId ?? visibleDeals[0]?.id ?? "",
          assignedToUserId: currentUser.id,
        }
  );

  React.useEffect(() => {
    if (task) {
      setForm(taskToForm(task));
    }
  }, [task]);

  React.useEffect(() => {
    if (defaultDealId) {
      setForm((prev) => ({ ...prev, dealId: defaultDealId }));
    }
  }, [defaultDealId]);

  React.useEffect(() => {
    if (!isAdd || defaultDealId) return;
    if (!form.dealId && visibleDeals[0]) {
      setForm((prev) => ({ ...prev, dealId: visibleDeals[0].id }));
    }
  }, [form.dealId, visibleDeals, isAdd, defaultDealId]);

  React.useEffect(() => {
    if (!canAssign) {
      setForm((prev) => ({ ...prev, assignedToUserId: currentUser.id }));
    }
  }, [currentUser.id, canAssign]);

  const update = <K extends keyof TaskFormState>(
    field: K,
    value: TaskFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.dealId) return;

    if (isAdd) {
      addDealTask({
        dealId: form.dealId,
        title: form.title.trim(),
        dueDate: form.dueDate,
        createdByUserId: currentUser.id,
        assignedToUserId: canAssign ? form.assignedToUserId : currentUser.id,
        assignerName: currentUser.name,
      });
      router.push(recordListRoutes.task);
      return;
    }

    if (!task) return;
    updateDealTask(task.id, {
      title: form.title.trim(),
      dueDate: form.dueDate,
      status: form.status,
      dealId: form.dealId,
      assignedToUserId: canAssign
        ? form.assignedToUserId
        : task.assignedToUserId,
      assignerName: currentUser.name,
    });
    router.push(recordListRoutes.task);
  };

  const handleDelete = () => {
    if (!task) return;
    deleteDealTask(task.id);
    router.push(recordListRoutes.task);
  };

  const viewDeal = (dealId: string) => {
    router.push(recordRoutes.deal(dealId));
  };

  if (!isAdd && !task) {
    return null;
  }

  return (
    <RecordFormPage
      backHref={recordListRoutes.task}
      backLabel="Tasks"
      title={isAdd ? "Add Task" : "Edit Task"}
      description={
        isAdd
          ? canAssign
            ? "Create a task and assign it to a team member."
            : "Create a task for yourself on a deal."
          : canAssign
            ? "Update a task and assign it to a team member."
            : "Update a task for yourself on a deal."
      }
      onSubmit={handleSubmit}
      footer={
        <>
          {!isAdd ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.task}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || !form.dealId}
            >
              {isAdd ? "Add Task" : "Save Changes"}
            </Button>
          </div>
        </>
      }
    >
      {isAdd ? (
        <FormSection>
          <FormField label="Added by" htmlFor="add-task-by">
            <p
              id="add-task-by"
              className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              {currentUser.name}
            </p>
          </FormField>

          <FormField label="Deal" htmlFor="add-task-deal">
            <FormSelect
              id="add-task-deal"
              value={form.dealId}
              onValueChange={(value) => update("dealId", value)}
              disabled={visibleDeals.length === 0}
              placeholder="Select a deal"
              options={visibleDeals.map((entry) => {
                const dealCustomer = getCustomerById(entry.customerId);
                return {
                  value: entry.id,
                  label: `${dealCustomer?.name ?? "Unknown"} · ${entry.id}`,
                };
              })}
            />
          </FormField>

          <FormField label="What to do" htmlFor="add-task-title">
            <Input
              id="add-task-title"
              placeholder="e.g. Send revised quote"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </FormField>

          <FormField label="Do by" htmlFor="add-task-due">
            <DatePicker
              value={form.dueDate}
              onChange={(value) => update("dueDate", value)}
              placeholder="Due date"
            />
          </FormField>

          <UserAssigneeSelect
            id="add-task-assignee"
            label="Assigned to"
            value={form.assignedToUserId}
            onValueChange={(value) => update("assignedToUserId", value)}
            adminOnly
          />
        </FormSection>
      ) : (
        <FormSection>
          {task ? (
            <FormField label="Task ID" htmlFor="task-id">
              <Input id="task-id" value={task.id} readOnly className="bg-muted/30 font-mono" />
            </FormField>
          ) : null}

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
              onValueChange={(value) => update("status", value as TaskStatus)}
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
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
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
              </div>
              {form.dealId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => viewDeal(form.dealId)}
                  aria-label="View linked deal"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </FormField>

          {task ? (
            <FormField label="Added by" htmlFor="task-created-by">
              <p
                id="task-created-by"
                className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
              >
                {getUserName(users, task.createdByUserId)}
              </p>
            </FormField>
          ) : null}

          <UserAssigneeSelect
            id="task-assignee"
            label="Assigned to"
            value={form.assignedToUserId}
            onValueChange={(value) => update("assignedToUserId", value)}
            adminOnly
          />
        </FormSection>
      )}
    </RecordFormPage>
  );
}
