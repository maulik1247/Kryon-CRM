"use client";

import * as React from "react";
import Link from "next/link";
import { ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { TasksMobileList } from "@/components/tasks/tasks-mobile-list";
import { canViewAllDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllTasksSorted } from "@/lib/deal-helpers";
import { getTaskStatusLabel, isTaskOpen } from "@/lib/task-constants";
import { filterTasksForUser, getUserName } from "@/lib/user-helpers";
import { cn, formatDate } from "@/lib/utils";

export function DashboardTasksCard() {
  const { currentUser, users } = useAuth();
  const seesAllDeals = canViewAllDeals(currentUser.role);
  const { dealTasks, deals, getCustomerById } = useCrmData();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const tasks = React.useMemo(() => {
    const visible = filterTasksForUser(dealTasks, currentUser, users, deals);
    return getAllTasksSorted(visible).filter((task) => isTaskOpen(task.status));
  }, [dealTasks, currentUser, users, deals]);

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(tasks);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSheetOpen(true);
  };

  const isOverdue = (task: (typeof paginatedItems)[number]) => {
    const dueDate = new Date(`${task.dueDate}T00:00:00`);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2">
          <ListTodo className="h-4 w-4" />
          <CardTitle>{seesAllDeals ? "All Open Tasks" : "My Open Tasks"}</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open tasks right now.
            </p>
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
                isOverdue={isOverdue}
                onOpenTask={openTask}
                showActions={false}
                showStatusSelect={false}
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

              <div className="hidden md:block">
                <MobileTableScroll>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Do by</TableHead>
                        {seesAllDeals ? <TableHead>Assigned to</TableHead> : null}
                        <TableHead>Deal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((task) => {
                        const deal = deals.find(
                          (entry) => entry.id === task.dealId
                        );
                        const customer = deal
                          ? getCustomerById(deal.customerId)
                          : undefined;
                        const dueDate = new Date(`${task.dueDate}T00:00:00`);
                        dueDate.setHours(0, 0, 0, 0);
                        const overdue = dueDate < today;

                        return (
                          <TableRow
                            key={task.id}
                            className="cursor-pointer"
                            onClick={() => openTask(task.id)}
                          >
                            <TableCell className="max-w-[200px] truncate font-medium">
                              {task.title}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary">
                                {getTaskStatusLabel(task.status)}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={cn(
                                "whitespace-nowrap",
                                overdue && "text-destructive"
                              )}
                            >
                              {formatDate(task.dueDate)}
                            </TableCell>
                            {seesAllDeals ? (
                              <TableCell className="max-w-[140px] truncate">
                                {getUserName(users, task.assignedToUserId)}
                              </TableCell>
                            ) : null}
                            <TableCell className="max-w-[160px] truncate text-muted-foreground">
                              {customer?.name ?? task.dealId}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
              </div>
            </>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href="/tasks">View all tasks</Link>
          </Button>
        </CardContent>
      </Card>

      <TaskSheet
        taskId={selectedTaskId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
