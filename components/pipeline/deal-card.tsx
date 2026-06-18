"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { DealCardDisplay } from "@/lib/deal-card-display";
import { RecordIdText } from "@/components/shared/record-id";
import type { Deal } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface DealCardProps {
  deal: Deal;
  display: DealCardDisplay;
  onClick?: () => void;
  isOverlay?: boolean;
  showHandle?: boolean;
}

export const DealCard = React.memo(function DealCard({
  deal,
  display,
  onClick,
  isOverlay,
  showHandle = true,
}: DealCardProps) {
  return (
    <Card
      className={cn(
        "w-full border-border/60 bg-card shadow-sm transition-smooth",
        isOverlay && "shadow-lg ring-1 ring-primary/20 scale-[1.02]",
        !isOverlay && "interactive-lift hover:border-border hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardContent className="space-y-3 p-3.5 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            {showHandle && (
              <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            )}
            <div className="min-w-0">
              <RecordIdText id={deal.id} className="mb-1 block" />
              <p className="truncate text-sm font-semibold leading-tight">
                {display.customerName}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {display.productsSummary}
                {display.supplierSuffix}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrency(deal.estimatedAnnualValue)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <ConfidenceBadge confidence={deal.confidence} className="text-[10px]" />
          <div className="flex items-center gap-1.5">
            <UserAvatar name={deal.owner} className="h-6 w-6" />
            <span className="max-w-[88px] truncate text-[11px] text-muted-foreground">
              {deal.owner.split(" ")[0]}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-border/50 bg-muted/20 px-2.5 py-2">
          {display.nextTask ? (
            <>
              <p className="line-clamp-1 text-xs font-medium">
                {display.nextTask.title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Do by {formatDate(display.nextTask.dueDate)}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground">No open task</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
