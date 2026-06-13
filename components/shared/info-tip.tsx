"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  label?: string;
  stopPropagation?: boolean;
}

export function InfoTip({
  content,
  className,
  iconClassName,
  side = "top",
  label = "More information",
  stopPropagation = true,
}: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label={label}
          onClick={
            stopPropagation
              ? (event) => event.stopPropagation()
              : undefined
          }
        >
          <CircleHelp className={cn("h-3.5 w-3.5", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[260px] text-left leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface InfoLabelProps {
  children: React.ReactNode;
  info: string;
  className?: string;
  tipSide?: InfoTipProps["side"];
}

export function InfoLabel({
  children,
  info,
  className,
  tipSide,
}: InfoLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {children}
      <InfoTip content={info} side={tipSide} label={`About ${children}`} />
    </span>
  );
}
