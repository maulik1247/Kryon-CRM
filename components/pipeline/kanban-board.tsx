"use client";

import * as React from "react";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  KanbanBoard as ReuiKanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DealCard } from "./deal-card";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { DealsMobileList } from "./deals-mobile-list";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  buildDealCardDisplayMap,
  type DealCardDisplay,
} from "@/lib/deal-card-display";
import { buildNextOpenTaskByDealId } from "@/lib/deal-helpers";
import { filterDealsForUser, canUserAccessDeal } from "@/lib/user-helpers";
import { recordRoutes } from "@/lib/record-routes";
import { getStageColumnStyle } from "@/lib/pipeline-styles";
import type { Deal, PipelineStageConfig } from "@/lib/types";
import { cn, formatCurrencyCr } from "@/lib/utils";

function dealsToColumns(
  deals: Deal[],
  stages: PipelineStageConfig[]
): Record<string, Deal[]> {
  const columns = Object.fromEntries(
    stages.map((stage) => [stage.id, [] as Deal[]])
  ) as Record<string, Deal[]>;

  for (const deal of deals) {
    (columns[deal.stage] ??= []).push(deal);
  }

  return columns;
}

function persistStageMoves(
  columns: Record<string, Deal[]>,
  stages: PipelineStageConfig[],
  moveDealToStage: (dealId: string, stageId: string) => void
) {
  for (const stage of stages) {
    for (const deal of columns[stage.id] ?? []) {
      if (deal.stage !== stage.id) {
        moveDealToStage(deal.id, stage.id);
      }
    }
  }
}

interface PipelineDealCardProps extends Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
> {
  deal: Deal;
  display: DealCardDisplay;
  onDealClick: (dealId: string) => void;
  asHandle?: boolean;
  isOverlay?: boolean;
}

const PipelineDealCard = React.memo(function PipelineDealCard({
  deal,
  display,
  onDealClick,
  asHandle,
  isOverlay,
  ...props
}: PipelineDealCardProps) {
  const cardContent = (
    <DealCard
      deal={deal}
      display={display}
      isOverlay={isOverlay}
      showHandle={asHandle && !isOverlay}
      onClick={() => onDealClick(deal.id)}
    />
  );

  return (
    <KanbanItem value={deal.id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
});

interface PipelineColumnProps extends Omit<
  ComponentProps<typeof KanbanColumn>,
  "children"
> {
  stage: PipelineStageConfig;
  deals: Deal[];
  cardDisplayByDealId: Map<string, DealCardDisplay>;
  onDealClick: (dealId: string) => void;
  isOverlay?: boolean;
}

const PipelineColumn = React.memo(function PipelineColumn({
  stage,
  deals: stageDeals,
  cardDisplayByDealId,
  onDealClick,
  isOverlay,
  ...props
}: PipelineColumnProps) {
  const totalValue = React.useMemo(
    () => stageDeals.reduce((sum, deal) => sum + deal.estimatedAnnualValue, 0),
    [stageDeals]
  );

  return (
    <KanbanColumn {...props}>
      <Card
        className={cn("flex w-[17rem] shrink-0 flex-col border shadow-none")}
        style={getStageColumnStyle(stage.color)}
      >
        <CardHeader className="space-y-1 border-b border-border/40 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 flex-1 text-sm font-medium leading-snug break-words">
              {stage.name}
            </span>
            <Badge variant="secondary" className="shrink-0 tabular-nums">
              {stageDeals.length}
            </Badge>
          </div>
          {stageDeals.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrencyCr(totalValue)}
            </p>
          )}
        </CardHeader>
        <CardContent className="min-h-[120px] flex-1 p-2">
          <KanbanColumnContent
            value={stage.id}
            className="flex flex-col gap-2"
          >
            {stageDeals.length === 0 && !isOverlay ? (
              <div className="flex items-center justify-center rounded-md border border-dashed border-border/60 px-3 py-8 text-center">
                <p className="text-xs text-muted-foreground">Drop deals here</p>
              </div>
            ) : (
              stageDeals.map((deal) => (
                <PipelineDealCard
                  key={deal.id}
                  deal={deal}
                  display={
                    cardDisplayByDealId.get(deal.id) ?? {
                      customerName: "Unknown customer",
                      productsSummary: "",
                      supplierSuffix: "",
                      nextTask: null,
                    }
                  }
                  onDealClick={onDealClick}
                  asHandle={!isOverlay}
                  isOverlay={isOverlay}
                />
              ))
            )}
          </KanbanColumnContent>
        </CardContent>
      </Card>
    </KanbanColumn>
  );
});

export function KanbanBoard() {
  const isMobile = useIsMobile();
  const { currentUser, users } = useAuth();
  const {
    deals,
    dealTasks,
    pipelineStages,
    moveDealToStage,
    getDealById,
    getCustomerById,
    getProductById,
    getSupplierById,
  } = useCrmData();

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const nextTaskByDealId = React.useMemo(
    () => buildNextOpenTaskByDealId(dealTasks),
    [dealTasks]
  );

  const cardDisplayByDealId = React.useMemo(
    () =>
      buildDealCardDisplayMap(visibleDeals, {
        getCustomerById,
        getProductById,
        getSupplierById,
        nextTaskByDealId,
      }),
    [
      visibleDeals,
      getCustomerById,
      getProductById,
      getSupplierById,
      nextTaskByDealId,
    ]
  );

  const persistedColumns = React.useMemo(
    () => dealsToColumns(visibleDeals, pipelineStages),
    [visibleDeals, pipelineStages]
  );

  const [dragColumns, setDragColumns] = React.useState<Record<
    string,
    Deal[]
  > | null>(null);
  const dragColumnsRef = React.useRef<Record<string, Deal[]> | null>(null);

  const columns = dragColumns ?? persistedColumns;

  const { goToDeal } = useRecordNavigation();

  const handleDealClick = React.useCallback(
    (dealId: string) => {
      goToDeal(dealId);
    },
    [goToDeal]
  );

  const handleValueChange = React.useCallback(
    (newColumns: Record<string, Deal[]>) => {
      dragColumnsRef.current = newColumns;
      setDragColumns(newColumns);
    },
    []
  );

  const handleDragStateChange = React.useCallback(
    (isDragging: boolean) => {
      if (isDragging) return;

      const pendingColumns = dragColumnsRef.current;
      if (pendingColumns) {
        persistStageMoves(pendingColumns, pipelineStages, moveDealToStage);
      }

      dragColumnsRef.current = null;
      setDragColumns(null);
    },
    [moveDealToStage, pipelineStages]
  );

  const findDeal = React.useCallback(
    (id: string) => {
      for (const stageDeals of Object.values(columns)) {
        const deal = stageDeals.find((item) => item.id === id);
        if (deal) return deal;
      }
      return getDealById(id);
    },
    [columns, getDealById]
  );

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.deal}
          canOpen={(id) => {
            const deal = getDealById(id);
            return deal
              ? canUserAccessDeal(deal, currentUser, users)
              : false;
          }}
        />
      </React.Suspense>

      {isMobile ? (
        <DealsMobileList
          deals={visibleDeals}
          pipelineStages={pipelineStages}
          cardDisplayByDealId={cardDisplayByDealId}
          onDealClick={handleDealClick}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
          <Kanban
            value={columns}
            onValueChange={handleValueChange}
            onDragStateChange={handleDragStateChange}
            getItemValue={(deal) => deal.id}
          >
            <ReuiKanbanBoard className="flex w-max min-w-full gap-3 p-3 sm:grid-cols-none">
              {pipelineStages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  value={stage.id}
                  deals={columns[stage.id] ?? []}
                  cardDisplayByDealId={cardDisplayByDealId}
                  onDealClick={handleDealClick}
                />
              ))}
            </ReuiKanbanBoard>

            <KanbanOverlay className="rounded-lg border border-dashed border-border bg-muted/30">
              {({ value, variant }) => {
                if (variant !== "item") return null;
                const deal = findDeal(String(value));
                if (!deal) return null;

                return (
                  <div className="w-[17rem]">
                    <PipelineDealCard
                      deal={deal}
                      display={
                        cardDisplayByDealId.get(deal.id) ?? {
                          customerName: "Unknown customer",
                          productsSummary: "",
                          supplierSuffix: "",
                          nextTask: null,
                        }
                      }
                      onDealClick={() => {}}
                      isOverlay
                    />
                  </div>
                );
              }}
            </KanbanOverlay>
          </Kanban>
        </div>
      )}
    </>
  );
}
