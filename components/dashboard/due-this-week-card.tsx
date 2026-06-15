"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getThisWeekTasks } from "@/lib/deal-helpers";
import { filterDealsForUser, filterTasksForUser } from "@/lib/user-helpers";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import { formatDate } from "@/lib/utils";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DueThisWeekCard() {
  const { currentUser, users } = useAuth();
  const { deals, dealTasks, pipelineStages, getCustomerById } = useCrmData();

  const visibleDeals = filterDealsForUser(deals, currentUser, users);
  const visibleTasks = filterTasksForUser(dealTasks, currentUser, users, deals);

  const tasks = getThisWeekTasks(
    visibleDeals,
    visibleTasks,
    pipelineStages,
    (customerId) => getCustomerById(customerId)?.name
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CalendarClock className="h-4 w-4" />
        <CardTitle>
          <InfoLabel info={HELP.dueThisWeek}>Due This Week</InfoLabel>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Clear week ahead"
            description="No open tasks are due this week on your deals."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/tasks">View tasks</Link>
              </Button>
            }
            className="border-none bg-transparent py-8 shadow-none"
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const dueDate = new Date(`${task.dueDate}T00:00:00`);
              dueDate.setHours(0, 0, 0, 0);
              const isOverdue = dueDate < today;
              const isToday = dueDate.getTime() === today.getTime();

              return (
                <Card key={task.id}>
                  <CardContent className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.customerName} · {task.dealId}
                      </p>
                    </div>
                    <Badge
                      variant={
                        isOverdue || isToday ? "default" : "secondary"
                      }
                      className="shrink-0 text-xs"
                    >
                      {isOverdue && !isToday ? "Overdue · " : ""}
                      {formatDate(task.dueDate)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
