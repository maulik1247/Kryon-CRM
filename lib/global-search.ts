import { getActivityTypeLabel } from "@/lib/activity-constants";
import { canAccessMasterData } from "@/lib/role-permissions";
import { getTaskStatusLabel } from "@/lib/task-constants";
import {
  filterActivitiesForUser,
  filterDealsForUser,
  filterTasksForUser,
} from "@/lib/user-helpers";
import { recordRoutes } from "@/lib/record-routes";
import type {
  Contact,
  CrmUser,
  Customer,
  Deal,
  DealActivity,
  DealTask,
  PipelineStageConfig,
  Product,
  Supplier,
} from "@/lib/types";

export type SearchResultType =
  | "customer"
  | "contact"
  | "deal"
  | "task"
  | "activity"
  | "product"
  | "supplier";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
  rank: number;
}

export interface SearchResultGroup {
  type: SearchResultType;
  label: string;
  results: SearchResult[];
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  customer: "Customers",
  contact: "Contacts",
  deal: "Deals",
  task: "Tasks",
  activity: "Activity",
  product: "Products",
  supplier: "Suppliers",
};

const RESULT_LIMIT_PER_TYPE = 5;

function rankMatch(query: string, ...fields: (string | undefined)[]) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return -1;

  let bestRank = -1;

  for (const field of fields) {
    if (!field) continue;
    const value = field.toLowerCase();

    if (value === normalizedQuery) {
      bestRank = Math.max(bestRank, 100);
    } else if (value.startsWith(normalizedQuery)) {
      bestRank = Math.max(bestRank, 75);
    } else if (value.includes(normalizedQuery)) {
      bestRank = Math.max(bestRank, 50);
    }
  }

  return bestRank;
}

function pushResult(
  bucket: SearchResult[],
  result: Omit<SearchResult, "rank"> & { rank: number }
) {
  if (result.rank < 0) return;
  bucket.push(result);
}

export interface GlobalSearchInput {
  query: string;
  customers: Customer[];
  contacts: Contact[];
  deals: Deal[];
  products: Product[];
  suppliers: Supplier[];
  dealTasks: DealTask[];
  dealActivities: DealActivity[];
  pipelineStages: PipelineStageConfig[];
  getCustomerById: (id: string) => Customer | undefined;
  currentUser: CrmUser;
  users: CrmUser[];
}

export function runGlobalSearch(input: GlobalSearchInput): SearchResultGroup[] {
  const query = input.query.trim();
  if (!query) return [];

  const results: SearchResult[] = [];
  const canSeeMasterData = canAccessMasterData(input.currentUser.role);
  const visibleDeals = filterDealsForUser(
    input.deals,
    input.currentUser,
    input.users
  );
  const visibleDealIds = new Set(visibleDeals.map((deal) => deal.id));
  const visibleTasks = filterTasksForUser(
    input.dealTasks,
    input.currentUser,
    input.users,
    input.deals
  );
  const visibleActivities = filterActivitiesForUser(
    input.dealActivities,
    input.deals,
    input.currentUser,
    input.users
  );

  for (const customer of input.customers) {
    if (!canSeeMasterData) continue;

    pushResult(results, {
      id: customer.id,
      type: "customer",
      title: customer.name,
      subtitle: [customer.oemSegment, customer.accountOwner]
        .filter(Boolean)
        .join(" · "),
      href: recordRoutes.customer(customer.id),
      rank: rankMatch(
        query,
        customer.name,
        customer.gstin,
        customer.vendorCode,
        customer.notes
      ),
    });
  }

  for (const contact of input.contacts) {
    if (!canSeeMasterData) continue;

    const customer = input.getCustomerById(contact.customerId);

    pushResult(results, {
      id: contact.id,
      type: "contact",
      title: contact.name,
      subtitle: [contact.designation, customer?.name].filter(Boolean).join(" · "),
      href: recordRoutes.contact(contact.id),
      rank: rankMatch(
        query,
        contact.name,
        contact.email,
        contact.phone,
        contact.officePhone,
        contact.designation,
        contact.department,
        contact.reportsTo,
        contact.notes,
        customer?.name
      ),
    });
  }

  for (const deal of visibleDeals) {
    const customer = input.getCustomerById(deal.customerId);
    const stageName =
      input.pipelineStages.find((stage) => stage.id === deal.stage)?.name ??
      deal.stage;

    pushResult(results, {
      id: deal.id,
      type: "deal",
      title: deal.id,
      subtitle: [customer?.name, stageName, deal.owner].filter(Boolean).join(" · "),
      href: recordRoutes.deal(deal.id),
      rank: rankMatch(
        query,
        deal.id,
        customer?.name,
        deal.owner,
        stageName
      ),
    });
  }

  for (const task of visibleTasks) {
    if (!visibleDealIds.has(task.dealId) && !canSeeMasterData) continue;

    const deal = input.deals.find((entry) => entry.id === task.dealId);
    const customer = deal ? input.getCustomerById(deal.customerId) : undefined;

    pushResult(results, {
      id: task.id,
      type: "task",
      title: task.title,
      subtitle: [
        getTaskStatusLabel(task.status),
        customer?.name ?? task.dealId,
      ]
        .filter(Boolean)
        .join(" · "),
      href: recordRoutes.task(task.id),
      rank: rankMatch(query, task.title, task.dealId, customer?.name),
    });
  }

  for (const activity of visibleActivities) {
    if (!visibleDealIds.has(activity.dealId) && !canSeeMasterData) continue;

    const deal = input.deals.find((entry) => entry.id === activity.dealId);
    const customer = deal ? input.getCustomerById(deal.customerId) : undefined;

    pushResult(results, {
      id: activity.id,
      type: "activity",
      title: activity.summary,
      subtitle: [
        getActivityTypeLabel(activity.type),
        customer?.name ?? activity.dealId,
      ]
        .filter(Boolean)
        .join(" · "),
      href: recordRoutes.activity(activity.id),
      rank: rankMatch(
        query,
        activity.summary,
        activity.outcome,
        activity.dealId,
        customer?.name
      ),
    });
  }

  for (const product of input.products) {
    if (!canSeeMasterData) continue;

    pushResult(results, {
      id: product.id,
      type: "product",
      title: product.model,
      subtitle: [product.sku, product.motorControllerType]
        .filter(Boolean)
        .join(" · "),
      href: recordRoutes.product(product.id),
      rank: rankMatch(
        query,
        product.model,
        product.sku,
        product.motorControllerType,
        product.hsnCode,
        product.description
      ),
    });
  }

  for (const supplier of input.suppliers) {
    if (!canSeeMasterData) continue;

    pushResult(results, {
      id: supplier.id,
      type: "supplier",
      title: supplier.name,
      subtitle: [supplier.type, supplier.region].filter(Boolean).join(" · "),
      href: recordRoutes.supplier(supplier.id),
      rank: rankMatch(
        query,
        supplier.name,
        supplier.type,
        supplier.region,
        supplier.notes
      ),
    });
  }

  results.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title));

  const grouped = new Map<SearchResultType, SearchResult[]>();

  for (const result of results) {
    const existing = grouped.get(result.type) ?? [];
    if (existing.length >= RESULT_LIMIT_PER_TYPE) continue;
    existing.push(result);
    grouped.set(result.type, existing);
  }

  const order: SearchResultType[] = [
    "customer",
    "deal",
    "contact",
    "task",
    "activity",
    "product",
    "supplier",
  ];

  return order
    .map((type) => ({
      type,
      label: TYPE_LABELS[type],
      results: grouped.get(type) ?? [],
    }))
    .filter((group) => group.results.length > 0);
}

export function getSearchTypeLabel(type: SearchResultType) {
  return TYPE_LABELS[type];
}
