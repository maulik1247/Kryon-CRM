import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartCardSkeleton } from "@/components/shared/chart-card-skeleton";
import { cn } from "@/lib/utils";

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
      </CardContent>
    </Card>
  );
}

function TasksCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-sm" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="ml-auto h-5 w-8 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-28" />
      </CardContent>
    </Card>
  );
}

function SideListCardSkeleton({ titleWidth = "w-28" }: { titleWidth?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className={cn("h-5", titleWidth)} />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border/50 p-3"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>

      <ChartCardSkeleton />

      <TasksCardSkeleton />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <SideListCardSkeleton titleWidth="w-32" />
        <SideListCardSkeleton titleWidth="w-36" />
      </div>
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCardSkeleton />
      <ChartCardSkeleton />
    </div>
  );
}
