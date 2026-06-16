"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { notifyInfo } from "@/lib/crm-notifications";
import { getRemindersForUser } from "@/lib/reminder-helpers";

export function useReminderUserToast() {
  const { currentUser } = useAuth();
  const { reminders } = useCrmData();
  const previousUserId = React.useRef(currentUser.id);

  React.useEffect(() => {
    if (previousUserId.current === currentUser.id) return;

    previousUserId.current = currentUser.id;
    const unread = getRemindersForUser(reminders, currentUser.id).filter(
      (reminder) => !reminder.readAt
    );

    if (unread.length > 0) {
      notifyInfo(
        `${unread.length} reminder${unread.length === 1 ? "" : "s"} for you`,
        "Open Reminders from the header to view assignments."
      );
    }
  }, [currentUser.id, reminders]);
}
