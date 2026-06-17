import { isAdminRole } from "@/lib/role-permissions";
import {
  filterActivitiesForUser,
  filterCustomersForUser,
  filterDealsForUser,
  filterDocumentExchangesForUser,
  filterTasksForUser,
} from "@/lib/user-helpers";
import type {
  Contact,
  CrmReminder,
  CrmUser,
  Customer,
  Deal,
  DealActivity,
  DealTask,
  DocumentExchange,
  Product,
  Supplier,
} from "@/lib/types";

export function filterBootstrapForUser(
  data: {
    customers: Customer[];
    contacts: Contact[];
    products: Product[];
    suppliers: Supplier[];
    deals: Deal[];
    dealTasks: DealTask[];
    dealActivities: DealActivity[];
    documentExchanges: DocumentExchange[];
    reminders: CrmReminder[];
    users: CrmUser[];
  },
  currentUser: CrmUser,
  allUsers: CrmUser[]
) {
  const deals = filterDealsForUser(data.deals, currentUser, allUsers);
  const dealIds = new Set(deals.map((deal) => deal.id));
  const customerIds = new Set(deals.map((deal) => deal.customerId));

  const customers = filterCustomersForUser(
    data.customers,
    currentUser,
    allUsers
  );
  const visibleCustomerIds = new Set(customers.map((c) => c.id));

  const contacts = isAdminRole(currentUser.role)
    ? data.contacts
    : data.contacts.filter(
        (contact) =>
          visibleCustomerIds.has(contact.customerId) ||
          customerIds.has(contact.customerId)
      );

  const products = isAdminRole(currentUser.role) ? data.products : data.products;
  const suppliers = isAdminRole(currentUser.role)
    ? data.suppliers
    : data.suppliers;

  const dealTasks = filterTasksForUser(
    data.dealTasks,
    currentUser,
    allUsers,
    deals
  );
  const dealActivities = filterActivitiesForUser(
    data.dealActivities,
    deals,
    currentUser,
    allUsers
  );
  const documentExchanges = filterDocumentExchangesForUser(
    data.documentExchanges,
    deals,
    currentUser,
    allUsers
  );
  const reminders = data.reminders.filter(
    (reminder) =>
      reminder.userId === currentUser.id &&
      (!reminder.dealId || dealIds.has(reminder.dealId))
  );

  const users = isAdminRole(currentUser.role) ? allUsers : [currentUser];

  return {
    customers,
    contacts,
    products,
    suppliers,
    deals,
    dealTasks,
    dealActivities,
    documentExchanges,
    reminders,
    users,
  };
}
