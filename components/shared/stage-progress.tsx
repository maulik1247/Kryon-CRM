import { cn } from "@/lib/utils";
import type { PipelineStage, PipelineStageConfig } from "@/lib/types";

interface StageProgressProps {
  stages: PipelineStageConfig[];
  currentStage: PipelineStage;
  className?: string;
}

export function StageProgress({
  stages,
  currentStage,
  className,
}: StageProgressProps) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentStage);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-0.5">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={cn(
              "h-2 flex-1 rounded-sm transition-colors",
              index <= currentIndex ? "bg-primary" : "bg-muted"
            )}
            style={
              index <= currentIndex
                ? { backgroundColor: stage.color }
                : undefined
            }
            title={stage.name}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{stages[0]?.name}</span>
        <span className="font-medium text-foreground">
          {stages.find((s) => s.id === currentStage)?.name ?? currentStage}
        </span>
        <span>{stages[stages.length - 1]?.name}</span>
      </div>
    </div>
  );
}
