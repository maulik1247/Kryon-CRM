"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getUnreadReminderCount } from "@/lib/reminder-helpers";

export const RemindersMenu = React.memo(function RemindersMenu() {
  const { currentUser } = useAuth();
  const { reminders } = useCrmData();
  const unreadCount = React.useMemo(
    () => getUnreadReminderCount(reminders, currentUser.id),
    [reminders, currentUser.id]
  );

  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="relative h-9 w-9 shrink-0"
    >
      <Link href="/reminders" aria-label="Reminders">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
            {unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
});
