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
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { useCrmLookups } from "@/hooks/use-crm-lookups";
import { useTaskDisplayHelpers } from "@/hooks/use-task-display";
import { ResponsiveView } from "@/components/shared/responsive-view";
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
  const { dealTasks, deals } = useCrmData();
  const { customerNameByDealId } = useCrmLookups();
  const {
    customerNameByDealIdFn,
    addedByName,
    assignedToName,
    isOverdue,
    todayStart,
  } = useTaskDisplayHelpers();
  const { goToTask } = useRecordNavigation();

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

  const openTask = React.useCallback(
    (taskId: string) => {
      goToTask(taskId);
    },
    [goToTask]
  );

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
              <ResponsiveView
                mobile={
                  <>
                    <TasksMobileList
                      tasks={paginatedItems}
                      customerNameByDealId={customerNameByDealIdFn}
                      addedByName={addedByName}
                      assignedToName={assignedToName}
                      isOverdue={isOverdue}
                      onOpenTask={openTask}
                      showActions={false}
                      showStatusSelect={false}
                    />
                    {totalItems > 0 ? (
                      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
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
                }
                desktop={
                  <>
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
                            const customerName =
                              customerNameByDealId.get(task.dealId) ?? task.dealId;
                            const overdue =
                              new Date(`${task.dueDate}T00:00:00`).getTime() <
                              todayStart;

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
                                  {customerName}
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
                  </>
                }
              />
            </>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href="/tasks">View all tasks</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
