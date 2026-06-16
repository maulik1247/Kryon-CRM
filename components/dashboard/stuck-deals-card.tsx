"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClickableCard } from "@/components/shared/clickable-card";
import { EmptyState } from "@/components/shared/empty-state";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { useCrmData } from "@/lib/crm-data-provider";
import { getStuckDeals } from "@/lib/deal-helpers";
import { formatCurrency } from "@/lib/utils";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import type { Deal } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

export function StuckDealsCard() {
  const { deals, pipelineStages, getCustomerById } = useCrmData();
  const stuckDeals = getStuckDeals(deals, pipelineStages, 14);
  const { goToDeal } = useRecordNavigation();

  const handleDealClick = (deal: Deal) => {
    goToDeal(deal.id);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <CardTitle>
            <InfoLabel info={HELP.stuckDeals}>Stuck Deals</InfoLabel>
          </CardTitle>
          <Badge variant="default" className="ml-auto">
            {stuckDeals.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {stuckDeals.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Pipeline is moving"
              description="No deals have been inactive for more than 14 days."
              className="border-none bg-transparent py-8 shadow-none"
            />
          ) : (
            <div className="space-y-2">
              {stuckDeals.map((deal) => {
                const customer = getCustomerById(deal.customerId);
                return (
                  <ClickableCard
                    key={deal.id}
                    onClick={() => handleDealClick(deal)}
                    className="shadow-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1 text-left">
                        <p className="truncate text-sm font-medium">
                          {customer?.name ?? "Unknown company"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.owner}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(deal.estimatedAnnualValue)}
                        </p>
                        <ConfidenceBadge
                          confidence={deal.confidence}
                          className="text-[10px]"
                        />
                      </div>
                    </div>
                  </ClickableCard>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
