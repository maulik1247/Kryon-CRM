import type { CrmReminder, CrmReminderKind } from "./types";

export function getRemindersForUser(reminders: CrmReminder[], userId: string) {
  return reminders
    .filter((reminder) => reminder.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getUnreadReminderCount(
  reminders: CrmReminder[],
  userId: string
) {
  return getRemindersForUser(reminders, userId).filter(
    (reminder) => !reminder.readAt
  ).length;
}

export function getReminderKindLabel(kind: CrmReminderKind) {
  switch (kind) {
    case "task_assigned":
      return "Task assigned";
    case "visit_assigned":
      return "Visit assigned";
    case "meeting_assigned":
      return "Meeting assigned";
    default:
      return "Reminder";
  }
}
