"use client";

import * as React from "react";
import { ListTodo } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { TableActions } from "@/components/shared/table-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import { DealSheet } from "@/components/deals/deal-sheet";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { TasksMobileList } from "@/components/tasks/tasks-mobile-list";
import { AddTaskSheet } from "@/components/tasks/add-task-sheet";
import { canViewAllDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllTasksSorted } from "@/lib/deal-helpers";
import { isTaskOpen, TASK_STATUS_OPTIONS } from "@/lib/task-constants";
import { filterTasksForUser, canUserAccessTask, canUserAccessDeal, getUserName } from "@/lib/user-helpers";
import type { Deal, TaskStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type TaskFilter = "open" | "completed" | "all";

export function TasksView() {
  const { currentUser, users } = useAuth();
  const seesAllDeals = canViewAllDeals(currentUser.role);
  const {
    dealTasks,
    deals,
    updateDealTaskStatus,
    deleteDealTask,
    getCustomerById,
    getDealById,
  } = useCrmData();

  const [filter, setFilter] = React.useState<TaskFilter>("open");
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null
  );
  const [taskSheetOpen, setTaskSheetOpen] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [dealSheetOpen, setDealSheetOpen] = React.useState(false);

  const tasks = React.useMemo(() => {
    const visible = filterTasksForUser(dealTasks, currentUser, users, deals);
    const sorted = getAllTasksSorted(visible);
    if (filter === "all") return sorted;
    if (filter === "completed") {
      return sorted.filter((task) => task.status === "completed");
    }
    return sorted.filter((task) => isTaskOpen(task.status));
  }, [dealTasks, filter, currentUser, users, deals]);

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(tasks, 10, filter);

  const openTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskSheetOpen(true);
  };

  const openTaskFromUrl = React.useCallback((id: string) => openTask(id), []);

  const openDeal = (dealId: string) => {
    const deal = getDealById(dealId);
    if (!deal || !canUserAccessDeal(deal, currentUser, users)) return;
    setSelectedDeal(deal);
    setDealSheetOpen(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openTaskFromUrl}
          canOpen={(id) => {
            const task = dealTasks.find((entry) => entry.id === id);
            return task
              ? canUserAccessTask(task, currentUser, users, deals)
              : false;
          }}
        />
      </React.Suspense>

      <PageToolbar
        description="Plan follow-ups, track status, and assign work across deals."
        meta={
          <span>
            <span className="font-medium text-foreground">{tasks.length}</span>{" "}
            {tasks.length === 1 ? "task" : "tasks"}
            {!seesAllDeals ? " assigned to you" : ""}
          </span>
        }
        filters={
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as TaskFilter)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={<AddTaskSheet />}
      />

      {tasks.length === 0 ? (
        <div className="md:hidden">
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Create a task to plan the next step on a deal."
            action={<AddTaskSheet />}
          />
        </div>
      ) : (
        <>
          <TasksMobileList
            tasks={paginatedItems}
            customerNameByDealId={(dealId) => {
              const deal = deals.find((entry) => entry.id === dealId);
              return deal ? getCustomerById(deal.customerId)?.name : undefined;
            }}
            addedByName={(userId) => getUserName(users, userId)}
            assignedToName={(userId) => getUserName(users, userId)}
            isOverdue={(task) => {
              const dueDate = new Date(`${task.dueDate}T00:00:00`);
              dueDate.setHours(0, 0, 0, 0);
              return isTaskOpen(task.status) && dueDate < today;
            }}
            onOpenTask={openTask}
            onOpenDeal={openDeal}
            onStatusChange={updateDealTaskStatus}
            onDelete={(task) => deleteDealTask(task.id)}
          />
          {totalItems > 0 ? (
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm md:hidden">
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </>
      )}

      <Card className="hidden overflow-hidden shadow-sm md:block">
        <MobileTableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>
                  <InfoLabel info={HELP.taskStatus}>Status</InfoLabel>
                </TableHead>
                <TableHead>
                  <InfoLabel info={HELP.doBy}>Do by</InfoLabel>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={ListTodo}
                      title="No tasks yet"
                      description="Create a task to plan the next step on a deal."
                      action={<AddTaskSheet />}
                      className="m-4 border-none bg-transparent shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((task) => {
                  const deal = deals.find(
                    (entry) => entry.id === task.dealId
                  );
                  const customer = deal
                    ? getCustomerById(deal.customerId)
                    : undefined;
                  const dueDate = new Date(`${task.dueDate}T00:00:00`);
                  dueDate.setHours(0, 0, 0, 0);
                  const isOverdue =
                    isTaskOpen(task.status) && dueDate < today;

                  return (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer"
                      onClick={() => openTask(task.id)}
                    >
                      <TableCell
                        className={cn(
                          "max-w-[240px] truncate font-medium",
                          task.status === "completed" &&
                            "text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            updateDealTaskStatus(
                              task.id,
                              value as TaskStatus
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_STATUS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap",
                          isOverdue && "text-destructive"
                        )}
                      >
                        {formatDate(task.dueDate)}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {customer?.name ?? "—"}
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap text-primary underline-offset-4 hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDeal(task.dealId);
                        }}
                      >
                        {task.dealId}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {getUserName(users, task.createdByUserId)}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {getUserName(users, task.assignedToUserId)}
                      </TableCell>
                      <TableCell
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TableActions
                          onEdit={() => openTask(task.id)}
                          onDelete={() => deleteDealTask(task.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </MobileTableScroll>
        {totalItems > 0 ? (
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
          />
        ) : null}
      </Card>

      <TaskSheet
        taskId={selectedTaskId}
        open={taskSheetOpen}
        onOpenChange={setTaskSheetOpen}
        onViewDeal={openDeal}
      />

      <DealSheet
        deal={selectedDeal}
        open={dealSheetOpen}
        onOpenChange={setDealSheetOpen}
      />
    </>
  );
}
