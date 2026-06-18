import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = ["45%", "72%", "58%", "84%", "63%", "76%", "52%"];

export function BarChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] items-end gap-2 border-t border-border/40 px-3 pb-2 pt-6",
        className
      )}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <Skeleton
          key={index}
          className="flex-1 rounded-t-md"
          style={{ height }}
        />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({
  className,
  chartClassName,
}: {
  className?: string;
  chartClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-2 pb-3">
        <Skeleton className="h-5 w-48 max-w-[70%]" />
        <Skeleton className="h-3 w-64 max-w-[85%]" />
      </CardHeader>
      <CardContent className="pt-0">
        <BarChartSkeleton className={chartClassName} />
      </CardContent>
    </Card>
  );
}
