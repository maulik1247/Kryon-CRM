import type {
  Contact,
  CrmReminder,
  CrmUser,
  Customer,
  Deal,
  DealActivity,
  DealTask,
  DocumentExchange,
  MasterDataLists,
  PipelineStageConfig,
  Product,
  Supplier,
  UserRole,
} from "@/lib/types";

export function mapUser(row: {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  reportsToUserId: string | null;
}): CrmUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    active: row.active,
    reportsToUserId: row.reportsToUserId ?? undefined,
  };
}

export function mapPayload<T>(payload: unknown): T {
  return payload as T;
}

export function mapCustomer(row: { id: string; payload: unknown }): Customer {
  return mapPayload<Customer>(row.payload);
}

export function mapContact(row: { id: string; payload: unknown }): Contact {
  return mapPayload<Contact>(row.payload);
}

export function mapProduct(row: { id: string; payload: unknown }): Product {
  return mapPayload<Product>(row.payload);
}

export function mapSupplier(row: { id: string; payload: unknown }): Supplier {
  return mapPayload<Supplier>(row.payload);
}

export function mapDeal(row: { id: string; payload: unknown }): Deal {
  return mapPayload<Deal>(row.payload);
}

export function mapDealTask(row: { id: string; payload: unknown }): DealTask {
  return mapPayload<DealTask>(row.payload);
}

export function mapDealActivity(row: {
  id: string;
  payload: unknown;
}): DealActivity {
  return mapPayload<DealActivity>(row.payload);
}

export function mapDocumentExchange(row: {
  id: string;
  payload: unknown;
}): DocumentExchange {
  return mapPayload<DocumentExchange>(row.payload);
}

export function mapReminder(row: { id: string; payload: unknown }): CrmReminder {
  return mapPayload<CrmReminder>(row.payload);
}

export function mapPipelineStages(payload: unknown): PipelineStageConfig[] {
  return payload as PipelineStageConfig[];
}

export function mapMasterData(payload: unknown): MasterDataLists {
  return payload as MasterDataLists;
}
