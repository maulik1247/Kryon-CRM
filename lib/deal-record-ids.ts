import type { CrmReminder, DealActivity, DealTask } from "./types";

export function createDealTaskId(existing: DealTask[]): string {
  const max = existing.reduce((highest, task) => {
    const match = task.id.match(/task-(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `task-${max + 1}`;
}

export function createDealActivityId(existing: DealActivity[]): string {
  const max = existing.reduce((highest, activity) => {
    const match = activity.id.match(/activity-(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `activity-${max + 1}`;
}

export function createReminderId(existing: CrmReminder[]): string {
  const max = existing.reduce((highest, reminder) => {
    const match = reminder.id.match(/reminder-(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `reminder-${max + 1}`;
}
