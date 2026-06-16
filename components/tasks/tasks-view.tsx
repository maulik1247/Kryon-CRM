"use client";

import * as React from "react";
import Link from "next/link";
import { ListTodo, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import { TasksMobileList } from "@/components/tasks/tasks-mobile-list";
import { canViewAllDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllTasksSorted } from "@/lib/deal-helpers";
import { isTaskOpen, TASK_STATUS_OPTIONS } from "@/lib/task-constants";
import { filterTasksForUser, canUserAccessTask, getUserName } from "@/lib/user-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import type { TaskStatus } from "@/lib/types";
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
  } = useCrmData();
  const { goToTask, goToDeal } = useRecordNavigation();

  const [filter, setFilter] = React.useState<TaskFilter>("open");

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

  const openDeal = (dealId: string) => {
    goToDeal(dealId);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.task}
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
        actions={
          <Button asChild>
            <Link href={recordNewRoutes.task}>
              <Plus className="h-4 w-4" />
              Add Task
            </Link>
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <div className="md:hidden">
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Create a task to plan the next step on a deal."
            action={
              <Button asChild>
                <Link href={recordNewRoutes.task}>
                  <Plus className="h-4 w-4" />
                  Add Task
                </Link>
              </Button>
            }
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
            onOpenTask={goToTask}
            onOpenDeal={openDeal}
            onStatusChange={updateDealTaskStatus}
            onDelete={(task) => deleteDealTask(task.id)}
            openOnTap
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
                <TableHead>ID</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>
                  <InfoLabel info={HELP.taskStatus}>Status</InfoLabel>
                </TableHead>
                <TableHead>
                  <InfoLabel info={HELP.doBy}>Do by</InfoLabel>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Added on</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState
                      icon={ListTodo}
                      title="No tasks yet"
                      description="Create a task to plan the next step on a deal."
                      action={
              <Button asChild>
                <Link href={recordNewRoutes.task}>
                  <Plus className="h-4 w-4" />
                  Add Task
                </Link>
              </Button>
            }
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
                      onClick={() => goToTask(task.id)}
                    >
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {task.id}
                      </TableCell>
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
                        {getUserName(users, task.assignedToUserId)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {getUserName(users, task.createdByUserId)}
                      </TableCell>
                      <TableCell
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TableActions
                          onEdit={() => goToTask(task.id)}
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
    </>
  );
}
