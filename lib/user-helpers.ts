import {
  canAccessMasterData,
  getDealOwnersVisibleToUser,
} from "./role-permissions";
import type {
  CrmUser,
  Customer,
  Deal,
  DealActivity,
  DealActivityType,
  DealTask,
  DocumentExchange,
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

export function filterDealsForUser(
  deals: Deal[],
  currentUser: CrmUser,
  users: CrmUser[]
) {
  const owners = getDealOwnersVisibleToUser(currentUser, users);
  if (owners === "all") return deals;
  if (owners === "none") return [];
  return deals.filter((deal) => owners.has(deal.owner));
}

export function filterCustomersForUser(
  customers: Customer[],
  currentUser: CrmUser,
  users: CrmUser[]
) {
  if (canAccessMasterData(currentUser.role)) return customers;

  const owners = getDealOwnersVisibleToUser(currentUser, users);
  if (owners === "all") return customers;
  if (owners === "none") return [];
  return customers.filter((customer) => owners.has(customer.accountOwner));
}

export function filterTasksForUser(
  tasks: DealTask[],
  currentUser: CrmUser,
  users: CrmUser[],
  deals: Deal[]
) {
  const owners = getDealOwnersVisibleToUser(currentUser, users);
  if (owners === "all") return tasks;
  if (owners === "none") {
    return tasks.filter((task) => task.assignedToUserId === currentUser.id);
  }

  const visibleDealIds = new Set(
    deals
      .filter((deal) => owners.has(deal.owner))
      .map((deal) => deal.id)
  );

  return tasks.filter(
    (task) =>
      task.assignedToUserId === currentUser.id ||
      visibleDealIds.has(task.dealId)
  );
}

export function filterActivitiesForUser(
  activities: DealActivity[],
  deals: Deal[],
  currentUser: CrmUser,
  users: CrmUser[]
) {
  const owners = getDealOwnersVisibleToUser(currentUser, users);
  if (owners === "all") return activities;
  if (owners === "none") {
    return activities.filter(
      (activity) =>
        activity.loggedByUserId === currentUser.id ||
        activity.assignedToUserId === currentUser.id
    );
  }

  const visibleDealIds = new Set(
    deals
      .filter((deal) => owners.has(deal.owner))
      .map((deal) => deal.id)
  );

  return activities.filter(
    (activity) =>
      activity.loggedByUserId === currentUser.id ||
      activity.assignedToUserId === currentUser.id ||
      visibleDealIds.has(activity.dealId)
  );
}

export function filterDocumentExchangesForUser(
  records: DocumentExchange[],
  deals: Deal[],
  currentUser: CrmUser,
  users: CrmUser[]
) {
  const owners = getDealOwnersVisibleToUser(currentUser, users);
  if (owners === "all") return records;
  if (owners === "none") return [];

  const visibleDealIds = new Set(
    deals
      .filter((deal) => owners.has(deal.owner))
      .map((deal) => deal.id)
  );
  const visibleCustomerIds = new Set(
    deals
      .filter((deal) => owners.has(deal.owner))
      .map((deal) => deal.customerId)
  );

  return records.filter(
    (record) =>
      (record.dealId && visibleDealIds.has(record.dealId)) ||
      visibleCustomerIds.has(record.customerId)
  );
}

export function canUserAccessDeal(
  deal: Deal,
  currentUser: CrmUser,
  users: CrmUser[]
) {
  return filterDealsForUser([deal], currentUser, users).length > 0;
}

export function canUserAccessTask(
  task: DealTask,
  currentUser: CrmUser,
  users: CrmUser[],
  deals: Deal[]
) {
  return filterTasksForUser([task], currentUser, users, deals).length > 0;
}

export function canUserAccessActivity(
  activity: DealActivity,
  deals: Deal[],
  currentUser: CrmUser,
  users: CrmUser[]
) {
  return (
    filterActivitiesForUser([activity], deals, currentUser, users).length > 0
  );
}

export function resolveUserIdByName(users: CrmUser[], name: string) {
  return users.find((user) => user.name === name)?.id ?? "user-admin";
}

export function getManagerOptions(users: CrmUser[]) {
  return users.filter(
    (user) =>
      user.active &&
      (user.role === "sales_manager" ||
        user.role === "commercial_manager" ||
        user.role === "vp_director" ||
        user.role === "admin")
  );
}
