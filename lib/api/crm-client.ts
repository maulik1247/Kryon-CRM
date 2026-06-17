import type {
  Contact,
  CrmUser,
  Customer,
  Deal,
  DealActivity,
  DealTask,
  DocumentExchange,
  MasterDataLists,
  PipelineStage,
  PipelineStageConfig,
  Product,
  Supplier,
  TaskStatus,
} from "@/lib/types";

export type BootstrapResponse = {
  customers: Customer[];
  contacts: Contact[];
  products: Product[];
  suppliers: Supplier[];
  deals: Deal[];
  dealTasks: DealTask[];
  dealActivities: DealActivity[];
  documentExchanges: DocumentExchange[];
  reminders: import("@/lib/types").CrmReminder[];
  pipelineStages: PipelineStageConfig[];
  masterData: MasterDataLists;
  users: CrmUser[];
  currentUser: CrmUser;
};

async function crmFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === "string"
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const crmClient = {
  bootstrap: () => crmFetch<BootstrapResponse>("/api/crm/bootstrap"),

  createDeal: (deal: Deal) =>
    crmFetch<Deal>("/api/crm/deals", {
      method: "POST",
      body: JSON.stringify(deal),
    }),

  updateDeal: (dealId: string, updates: Partial<Deal>) =>
    crmFetch<Deal>(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteDeal: (dealId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/deals/${dealId}`, {
      method: "DELETE",
    }),

  moveDealToStage: (dealId: string, stage: PipelineStage) =>
    crmFetch<Deal>(`/api/crm/deals/${dealId}/stage`, {
      method: "POST",
      body: JSON.stringify({ stage }),
    }),

  createTask: (
    task: DealTask & {
      assignerName?: string;
    }
  ) =>
    crmFetch<DealTask>("/api/crm/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  updateTask: (
    taskId: string,
    updates: Partial<DealTask> & { assignerName?: string }
  ) =>
    crmFetch<DealTask>(`/api/crm/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    crmFetch<DealTask>(`/api/crm/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (taskId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/tasks/${taskId}`, {
      method: "DELETE",
    }),

  upsertCustomer: (customer: Customer) =>
    crmFetch<Customer>("/api/crm/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    }),

  updateCustomer: (customerId: string, updates: Partial<Customer>) =>
    crmFetch<Customer>(`/api/crm/customers/${customerId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteCustomer: (customerId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/customers/${customerId}`, {
      method: "DELETE",
    }),

  upsertContact: (contact: Contact) =>
    crmFetch<Contact>("/api/crm/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    }),

  updateContact: (contactId: string, updates: Partial<Contact>) =>
    crmFetch<Contact>(`/api/crm/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteContact: (contactId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/contacts/${contactId}`, {
      method: "DELETE",
    }),

  upsertProduct: (product: Product) =>
    crmFetch<Product>("/api/crm/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  updateProduct: (productId: string, updates: Partial<Product>) =>
    crmFetch<Product>(`/api/crm/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteProduct: (productId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/products/${productId}`, {
      method: "DELETE",
    }),

  upsertSupplier: (supplier: Supplier) =>
    crmFetch<Supplier>("/api/crm/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    }),

  updateSupplier: (supplierId: string, updates: Partial<Supplier>) =>
    crmFetch<Supplier>(`/api/crm/suppliers/${supplierId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteSupplier: (supplierId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/suppliers/${supplierId}`, {
      method: "DELETE",
    }),

  upsertActivity: (activity: DealActivity) =>
    crmFetch<DealActivity>("/api/crm/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    }),

  updateActivity: (activityId: string, updates: Partial<DealActivity>) =>
    crmFetch<DealActivity>(`/api/crm/activities/${activityId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteActivity: (activityId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/activities/${activityId}`, {
      method: "DELETE",
    }),

  upsertDocument: (record: DocumentExchange) =>
    crmFetch<DocumentExchange>("/api/crm/documents", {
      method: "POST",
      body: JSON.stringify(record),
    }),

  updateDocument: (recordId: string, updates: Partial<DocumentExchange>) =>
    crmFetch<DocumentExchange>(`/api/crm/documents/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteDocument: (recordId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/documents/${recordId}`, {
      method: "DELETE",
    }),

  markReminderRead: (reminderId: string) =>
    crmFetch<import("@/lib/types").CrmReminder>(
      `/api/crm/reminders/${reminderId}/read`,
      { method: "PATCH" }
    ),

  markAllRemindersRead: () =>
    crmFetch<{ ok: boolean }>("/api/crm/reminders/read-all", {
      method: "POST",
    }),

  updateSettings: (updates: {
    pipelineStages?: PipelineStageConfig[];
    masterData?: MasterDataLists;
  }) =>
    crmFetch<{ ok: boolean }>("/api/crm/settings", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  createUser: (user: Omit<CrmUser, "id">) =>
    crmFetch<CrmUser>("/api/crm/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  updateUser: (userId: string, updates: Partial<CrmUser>) =>
    crmFetch<CrmUser>(`/api/crm/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteUser: (userId: string) =>
    crmFetch<{ ok: boolean }>(`/api/crm/users/${userId}`, {
      method: "DELETE",
    }),
};
