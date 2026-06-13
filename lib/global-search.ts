import { getActivityTypeLabel } from "@/lib/activity-constants";
import { getTaskStatusLabel } from "@/lib/task-constants";
import {
  filterActivitiesForUser,
  filterDealsForUser,
  filterTasksForUser,
} from "@/lib/user-helpers";
import type {
  Contact,
  Customer,
  Deal,
  DealActivity,
  DealTask,
  PipelineStageConfig,
  Product,
} from "@/lib/types";

export type SearchResultType =
  | "customer"
  | "contact"
  | "deal"
  | "task"
  | "activity"
  | "product";

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
  dealTasks: DealTask[];
  dealActivities: DealActivity[];
  pipelineStages: PipelineStageConfig[];
  getCustomerById: (id: string) => Customer | undefined;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
}

export function runGlobalSearch(input: GlobalSearchInput): SearchResultGroup[] {
  const query = input.query.trim();
  if (!query) return [];

  const results: SearchResult[] = [];
  const visibleDeals = filterDealsForUser(
    input.deals,
    input.currentUserName,
    input.isAdmin
  );
  const visibleDealIds = new Set(visibleDeals.map((deal) => deal.id));
  const visibleTasks = filterTasksForUser(
    input.dealTasks,
    input.currentUserId,
    input.isAdmin
  );
  const visibleActivities = filterActivitiesForUser(
    input.dealActivities,
    input.currentUserId,
    input.isAdmin
  );

  for (const customer of input.customers) {
    if (!input.isAdmin && customer.accountOwner !== input.currentUserName) {
      continue;
    }

    pushResult(results, {
      id: customer.id,
      type: "customer",
      title: customer.name,
      subtitle: [customer.oemSegment, customer.accountOwner]
        .filter(Boolean)
        .join(" · "),
      href: `/customers?open=${customer.id}`,
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
    const customer = input.getCustomerById(contact.customerId);
    if (!input.isAdmin && customer?.accountOwner !== input.currentUserName) {
      continue;
    }

    pushResult(results, {
      id: contact.id,
      type: "contact",
      title: contact.name,
      subtitle: [contact.designation, customer?.name].filter(Boolean).join(" · "),
      href: `/contacts?open=${contact.id}`,
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
      href: `/deal-pipeline?open=${deal.id}`,
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
    if (!visibleDealIds.has(task.dealId) && !input.isAdmin) continue;

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
      href: `/tasks?open=${task.id}`,
      rank: rankMatch(query, task.title, task.dealId, customer?.name),
    });
  }

  for (const activity of visibleActivities) {
    if (!visibleDealIds.has(activity.dealId) && !input.isAdmin) continue;

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
      href: `/activity-log?open=${activity.id}`,
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
    pushResult(results, {
      id: product.id,
      type: "product",
      title: product.model,
      subtitle: [product.sku, product.motorControllerType]
        .filter(Boolean)
        .join(" · "),
      href: `/products?open=${product.id}`,
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
