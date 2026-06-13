"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  getReminderKindLabel,
  getRemindersForUser,
} from "@/lib/reminder-helpers";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
type ReminderFilter = "all" | "unread" | "read";

export function RemindersView() {
  const { currentUser } = useAuth();
  const { reminders, markReminderRead, markAllRemindersRead } = useCrmData();
  const [filter, setFilter] = React.useState<ReminderFilter>("unread");

  const userReminders = React.useMemo(
    () => getRemindersForUser(reminders, currentUser.id),
    [reminders, currentUser.id]
  );

  const visibleReminders = React.useMemo(() => {
    if (filter === "all") return userReminders;
    if (filter === "unread") {
      return userReminders.filter((reminder) => !reminder.readAt);
    }
    return userReminders.filter((reminder) => Boolean(reminder.readAt));
  }, [userReminders, filter]);

  const unreadCount = userReminders.filter(
    (reminder) => !reminder.readAt
  ).length;

  return (
    <>
      <PageToolbar
        description="Assignments and follow-ups that need your attention."
        meta={
          <span>
            <span className="font-medium text-foreground">
              {visibleReminders.length}
            </span>{" "}
            {visibleReminders.length === 1 ? "reminder" : "reminders"}
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
          </span>
        }
        filters={
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as ReminderFilter)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter reminders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => markAllRemindersRead(currentUser.id)}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {visibleReminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "All caught up" : "No reminders here"}
          description={
            filter === "unread"
              ? "You have no unread reminders right now."
              : "Reminders appear when tasks or visits are assigned to you."
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleReminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={cn(!reminder.readAt && "border-primary/30 bg-primary/5")}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {getReminderKindLabel(reminder.kind)}
                      </Badge>
                      {!reminder.readAt && (
                        <Badge className="text-[10px]">New</Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        reminder.readAt
                          ? "text-muted-foreground"
                          : "font-medium"
                      )}
                    >
                      {reminder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.message}
                    </p>
                  </div>
                  {!reminder.readAt && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => markReminderRead(reminder.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {reminder.dueDate
                      ? `Due ${formatDate(reminder.dueDate)}`
                      : reminder.dealId}
                    {" · "}
                    {reminder.dealId}
                  </span>
                  <div className="flex items-center gap-2">
                    {reminder.taskId && (
                      <Link
                        href="/tasks"
                        className="text-primary hover:underline"
                      >
                        View tasks
                      </Link>
                    )}
                    {(reminder.kind === "visit_assigned" ||
                      reminder.kind === "meeting_assigned") && (
                      <Link
                        href="/activity-log"
                        className="text-primary hover:underline"
                      >
                        View activity
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
