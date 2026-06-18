import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DealCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-4 w-14 shrink-0" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="w-[17rem] shrink-0 space-y-3 rounded-lg border border-border/60 bg-card/80 p-3">
      <div className="space-y-2 border-b border-border/40 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-2">
        <DealCardSkeleton />
        <DealCardSkeleton />
      </div>
    </div>
  );
}
