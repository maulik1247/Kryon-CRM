export const recordRoutes = {
  customer: (id: string) => `/customers/${id}`,
  contact: (id: string) => `/contacts/${id}`,
  product: (id: string) => `/products/${id}`,
  supplier: (id: string) => `/suppliers/${id}`,
  document: (id: string) => `/document-exchange/${id}`,
  deal: (id: string) => `/deal-pipeline/${id}`,
  task: (id: string) => `/tasks/${id}`,
  activity: (id: string) => `/activity-log/${id}`,
} as const;

export const recordNewRoutes = {
  customer: "/customers/new",
  contact: "/contacts/new",
  product: "/products/new",
  supplier: "/suppliers/new",
  document: "/document-exchange/new",
  deal: "/deal-pipeline/new",
  task: "/tasks/new",
  activity: "/activity-log/new",
} as const;

export const recordListRoutes = {
  customer: "/customers",
  contact: "/contacts",
  product: "/products",
  supplier: "/suppliers",
  document: "/document-exchange",
  deal: "/deal-pipeline",
  task: "/tasks",
  activity: "/activity-log",
} as const;
