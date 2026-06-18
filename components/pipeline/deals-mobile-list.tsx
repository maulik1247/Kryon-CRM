"use client";

import * as React from "react";
import { Kanban } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { DealCard } from "./deal-card";
import type { DealCardDisplay } from "@/lib/deal-card-display";
import type { Deal, PipelineStageConfig } from "@/lib/types";

function getDefaultStageId(
  stages: PipelineStageConfig[],
  deals: Deal[]
): string {
  const openStages = stages.filter((stage) => stage.kind === "open");
  const stageWithDeals = openStages.find((stage) =>
    deals.some((deal) => deal.stage === stage.id)
  );
  return (
    stageWithDeals?.id ??
    openStages[0]?.id ??
    stages[0]?.id ??
    ""
  );
}

interface DealsMobileListProps {
  deals: Deal[];
  pipelineStages: PipelineStageConfig[];
  cardDisplayByDealId: Map<string, DealCardDisplay>;
  onDealClick: (dealId: string) => void;
}

export function DealsMobileList({
  deals,
  pipelineStages,
  cardDisplayByDealId,
  onDealClick,
}: DealsMobileListProps) {
  const defaultStageId = React.useMemo(
    () => getDefaultStageId(pipelineStages, deals),
    [pipelineStages, deals]
  );

  const [stageFilter, setStageFilter] = React.useState(defaultStageId);

  React.useEffect(() => {
    if (!pipelineStages.some((stage) => stage.id === stageFilter)) {
      setStageFilter(defaultStageId);
    }
  }, [defaultStageId, pipelineStages, stageFilter]);

  const dealCountByStage = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const deal of deals) {
      counts.set(deal.stage, (counts.get(deal.stage) ?? 0) + 1);
    }
    return counts;
  }, [deals]);

  const filteredDeals = React.useMemo(
    () => deals.filter((deal) => deal.stage === stageFilter),
    [deals, stageFilter]
  );

  if (!stageFilter) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {pipelineStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name} ({dealCountByStage.get(stage.id) ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredDeals.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No deals in this stage"
          description="Select another stage or add a new deal."
          className="py-10"
        />
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <DealCard
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
              showHandle={false}
              onClick={() => onDealClick(deal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
