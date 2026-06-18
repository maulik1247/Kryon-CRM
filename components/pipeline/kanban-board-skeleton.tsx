import { Skeleton } from "@/components/ui/skeleton";
import {
  DealCardSkeleton,
  KanbanColumnSkeleton,
} from "@/components/shared/deal-card-skeleton";

export function KanbanBoardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <DealCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border/60 bg-background md:block">
        <div className="flex w-max min-w-full gap-3 p-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <KanbanColumnSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
