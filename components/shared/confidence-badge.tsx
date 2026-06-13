"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CONFIDENCE_VARIANT,
  getConfidenceLabel,
} from "@/lib/confidence-constants";
import { HELP } from "@/lib/help-content";
import type { ConfidenceLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const CONFIDENCE_TONE: Record<ConfidenceLevel, string> = {
  100: "border-primary/30 bg-primary/10 text-primary",
  75: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  50: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  25: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  0: "border-border bg-muted/50 text-muted-foreground",
};

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: ConfidenceLevel;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={CONFIDENCE_VARIANT[confidence]}
          className={cn(
            "cursor-help border font-medium tabular-nums",
            CONFIDENCE_TONE[confidence],
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {getConfidenceLabel(confidence)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[260px] text-left leading-relaxed"
      >
        {HELP.confidence}
      </TooltipContent>
    </Tooltip>
  );
}
