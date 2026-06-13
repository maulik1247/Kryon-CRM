import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/types";

const CONFIDENCE_SEGMENTS: { level: ConfidenceLevel; label: string }[] = [
  { level: 100, label: "100%" },
  { level: 75, label: "75%" },
  { level: 50, label: "50%" },
  { level: 25, label: "25%" },
  { level: 0, label: "0%" },
];

interface ConfidenceMeterProps {
  confidence: ConfidenceLevel;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceMeter({
  confidence,
  size = "md",
  showLabel = false,
  className,
}: ConfidenceMeterProps) {
  const activeIndex = CONFIDENCE_SEGMENTS.findIndex(
    (s) => s.level === confidence
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex gap-0.5">
        {CONFIDENCE_SEGMENTS.map((segment, index) => (
          <div
            key={segment.level}
            className={cn(
              "rounded-sm transition-colors",
              size === "sm" ? "h-1.5 w-3" : "h-2 w-4",
              index <= activeIndex ? "bg-primary" : "bg-muted"
            )}
            title={`${segment.label} confidence`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {confidence}% confidence
        </span>
      )}
    </div>
  );
}
