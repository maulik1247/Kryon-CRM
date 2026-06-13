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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DealCard } from "./deal-card";
import { DealSheet } from "@/components/deals/deal-sheet";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { useCrmData } from "@/lib/crm-data-provider";
import { getStageColumnStyle } from "@/lib/pipeline-styles";
import type { Deal, PipelineStageConfig } from "@/lib/types";
import { cn, formatCurrencyCr } from "@/lib/utils";

function dealsToColumns(
  deals: Deal[],
  stages: PipelineStageConfig[]
): Record<string, Deal[]> {
  return stages.reduce<Record<string, Deal[]>>((columns, stage) => {
    columns[stage.id] = deals.filter((deal) => deal.stage === stage.id);
    return columns;
  }, {});
}

interface PipelineDealCardProps extends Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
> {
  deal: Deal;
  onDealClick: (deal: Deal) => void;
  asHandle?: boolean;
  isOverlay?: boolean;
}

function PipelineDealCard({
  deal,
  onDealClick,
  asHandle,
  isOverlay,
  ...props
}: PipelineDealCardProps) {
  const cardContent = (
    <DealCard
      deal={deal}
      isOverlay={isOverlay}
      showHandle={asHandle && !isOverlay}
      onClick={() => onDealClick(deal)}
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
}

interface PipelineColumnProps extends Omit<
  ComponentProps<typeof KanbanColumn>,
  "children"
> {
  stage: PipelineStageConfig;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  isOverlay?: boolean;
}

function PipelineColumn({
  stage,
  deals: stageDeals,
  onDealClick,
  isOverlay,
  ...props
}: PipelineColumnProps) {
  const totalValue = stageDeals.reduce(
    (sum, deal) => sum + deal.estimatedAnnualValue,
    0
  );

  return (
    <KanbanColumn {...props}>
      <Card
        className={cn(
          "flex w-[17rem] shrink-0 flex-col border shadow-none"
        )}
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
}

export function KanbanBoard() {
  const { deals, pipelineStages, moveDealToStage, getDealById } = useCrmData();
  const [columns, setColumns] = React.useState(() =>
    dealsToColumns(deals, pipelineStages)
  );
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setColumns(dealsToColumns(deals, pipelineStages));
  }, [deals, pipelineStages]);

  const handleValueChange = (newColumns: Record<string, Deal[]>) => {
    setColumns(newColumns);

    for (const stage of pipelineStages) {
      for (const deal of newColumns[stage.id] ?? []) {
        if (deal.stage !== stage.id) {
          moveDealToStage(deal.id, stage.id);
        }
      }
    }
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setSheetOpen(true);
  };

  const openDealFromUrl = React.useCallback(
    (id: string) => {
      const deal = getDealById(id);
      if (deal) handleDealClick(deal);
    },
    [getDealById]
  );

  const findDeal = (id: string) => {
    for (const stageDeals of Object.values(columns)) {
      const deal = stageDeals.find((item) => item.id === id);
      if (deal) return deal;
    }
    return getDealById(id);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openDealFromUrl}
          canOpen={(id) => Boolean(getDealById(id))}
        />
      </React.Suspense>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        <ScrollArea className="w-full">
          <Kanban
            value={columns}
            onValueChange={handleValueChange}
            getItemValue={(deal) => deal.id}
          >
            <ReuiKanbanBoard className="flex w-max min-w-full gap-3 p-3 sm:grid-cols-none">
              {pipelineStages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  value={stage.id}
                  deals={columns[stage.id] ?? []}
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
                      onDealClick={() => {}}
                      isOverlay
                    />
                  </div>
                );
              }}
            </KanbanOverlay>
          </Kanban>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <DealSheet
        deal={
          selectedDeal
            ? getDealById(selectedDeal.id) ?? selectedDeal
            : null
        }
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
