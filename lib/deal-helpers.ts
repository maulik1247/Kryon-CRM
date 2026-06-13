import { endOfWeek, parseISO, startOfDay } from "date-fns";
import { isTaskOpen } from "./task-constants";
import type {
  Deal,
  DealActivity,
  DealTask,
  DueThisWeekTask,
  PipelineStageConfig,
} from "./types";

export function getDealsByCustomerId(deals: Deal[], customerId: string) {
  return deals.filter((d) => d.customerId === customerId);
}

function isClosedStage(
  stageId: string,
  stages: PipelineStageConfig[]
): boolean {
  const stage = stages.find((s) => s.id === stageId);
  return stage?.kind === "won" || stage?.kind === "lost";
}

export function getStuckDeals(
  deals: Deal[],
  stages: PipelineStageConfig[],
  daysThreshold = 14
) {
  const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
  return deals.filter(
    (d) =>
      new Date(d.lastActivityAt).getTime() < cutoff &&
      !isClosedStage(d.stage, stages)
  );
}

export function getDashboardKPIs(
  deals: Deal[],
  stages: PipelineStageConfig[]
) {
  const activeDeals = deals.filter((d) => !isClosedStage(d.stage, stages));
  const pipelineValue = activeDeals.reduce(
    (sum, d) => sum + d.estimatedAnnualValue,
    0
  );
  const wonDeals = deals.filter(
    (d) => stages.find((s) => s.id === d.stage)?.kind === "won"
  ).length;
  const lostDeals = deals.filter(
    (d) => stages.find((s) => s.id === d.stage)?.kind === "lost"
  ).length;
  const closedDeals = wonDeals + lostDeals;
  const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;
  const posReceived = deals.filter(
    (d) => stages.find((s) => s.id === d.stage)?.name === "PO Received"
  ).length;
  const stuckDeals = getStuckDeals(deals, stages, 14);

  return {
    activeLeads: activeDeals.length,
    pipelineValue,
    conversionRate,
    posReceived,
    stuckDeals: stuckDeals.length,
  };
}

export function getDealsPerStage(
  deals: Deal[],
  stages: PipelineStageConfig[]
) {
  return stages
    .map((stage) => ({
      stage: stage.name,
      stageId: stage.id,
      color: stage.color,
      count: deals.filter((d) => d.stage === stage.id).length,
    }))
    .filter((s) => s.count > 0);
}

export function getActivitiesByDealId(
  activities: DealActivity[],
  dealId: string
) {
  return activities
    .filter((activity) => activity.dealId === dealId)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
}

export function getAllActivitiesSorted(activities: DealActivity[]) {
  return [...activities].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function compareTasksByStatusAndDueDate(a: DealTask, b: DealTask) {
  const aOpen = isTaskOpen(a.status);
  const bOpen = isTaskOpen(b.status);
  if (aOpen !== bOpen) {
    return aOpen ? -1 : 1;
  }
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
}

export function getTasksByDealId(tasks: DealTask[], dealId: string) {
  return tasks
    .filter((task) => task.dealId === dealId)
    .sort(compareTasksByStatusAndDueDate);
}

export function getAllTasksSorted(tasks: DealTask[]) {
  return [...tasks].sort(compareTasksByStatusAndDueDate);
}

export function getNextOpenTaskForDeal(tasks: DealTask[], dealId: string) {
  return getTasksByDealId(tasks, dealId).find((task) =>
    isTaskOpen(task.status)
  );
}

export function getThisWeekTasks(
  deals: Deal[],
  tasks: DealTask[],
  stages: PipelineStageConfig[],
  getCustomerName: (customerId: string) => string | undefined
): DueThisWeekTask[] {
  const now = new Date();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const openDealIds = new Set(
    deals
      .filter((deal) => !isClosedStage(deal.stage, stages))
      .map((deal) => deal.id)
  );

  return tasks
    .filter((task) => {
      if (!isTaskOpen(task.status) || !openDealIds.has(task.dealId)) return false;
      const dueDate = startOfDay(parseISO(task.dueDate));
      return dueDate <= weekEnd;
    })
    .map((task) => {
      const deal = deals.find((entry) => entry.id === task.dealId);
      return {
        id: task.id,
        dealId: task.dealId,
        title: task.title,
        dueDate: task.dueDate,
        customerName: deal
          ? (getCustomerName(deal.customerId) ?? "Unknown customer")
          : "Unknown customer",
      };
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
}

export function resolveDropStage(
  deals: Deal[],
  stageIds: string[],
  overId: string
): string | undefined {
  if (stageIds.includes(overId)) {
    return overId;
  }
  return deals.find((d) => d.id === overId)?.stage;
}
