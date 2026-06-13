import type {
  CrmUser,
  Deal,
  DealActivity,
  DealActivityType,
  DealTask,
} from "./types";

export const ASSIGNABLE_ACTIVITY_TYPES: DealActivityType[] = [
  "visit",
  "meeting",
];

export function getActiveUsers(users: CrmUser[]) {
  return users.filter((user) => user.active);
}

export function getUserName(users: CrmUser[], userId: string) {
  return users.find((user) => user.id === userId)?.name ?? "Unknown user";
}

export function isAssignableActivityType(type: DealActivityType) {
  return ASSIGNABLE_ACTIVITY_TYPES.includes(type);
}

export function filterTasksForUser(
  tasks: DealTask[],
  userId: string,
  isAdmin: boolean
) {
  if (isAdmin) return tasks;
  return tasks.filter((task) => task.assignedToUserId === userId);
}

export function filterActivitiesForUser(
  activities: DealActivity[],
  userId: string,
  isAdmin: boolean
) {
  if (isAdmin) return activities;
  return activities.filter(
    (activity) =>
      activity.loggedByUserId === userId ||
      activity.assignedToUserId === userId
  );
}

export function filterDealsForUser(
  deals: Deal[],
  userName: string,
  isAdmin: boolean
) {
  if (isAdmin) return deals;
  return deals.filter((deal) => deal.owner === userName);
}

export function resolveUserIdByName(users: CrmUser[], name: string) {
  return users.find((user) => user.name === name)?.id ?? "user-admin";
}
