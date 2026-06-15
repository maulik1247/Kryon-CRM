"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExpandableMobileCardProps {
  id: string;
  expandedId: string | null;
  onToggle: (id: string) => void;
  summary: React.ReactNode;
  details?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ExpandableMobileCard({
  id,
  expandedId,
  onToggle,
  summary,
  details,
  actions,
  className,
}: ExpandableMobileCardProps) {
  const isExpanded = expandedId === id;

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 shadow-sm transition-smooth hover:shadow-md",
        className
      )}
    >
      <button
        type="button"
        className="w-full p-4 text-left"
        onClick={() => onToggle(id)}
      >
        {summary}
      </button>

      {isExpanded && details ? (
        <div className="border-t bg-muted/20 px-4 py-4">{details}</div>
      ) : null}

      {actions ? (
        <div
          className="flex justify-end border-t px-3 py-2"
          onClick={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}
    </Card>
  );
}

export function useExpandableCards(initialId: string | null = null) {
  const [expandedId, setExpandedId] =
    React.useState<string | null>(initialId);

  const toggleExpanded = React.useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return { expandedId, toggleExpanded, setExpandedId };
}
