import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ToolbarSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  );
}

function MobileRowSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function DesktopTableSkeleton({ rows }: { rows: number }) {
  const columns = 6;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn("h-3", index === 0 ? "w-28" : "w-20")}
            />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-36" : colIndex === columns - 1 ? "w-12" : "w-24"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  rows = 7,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <ToolbarSkeleton />
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, index) => (
          <MobileRowSkeleton key={index} />
        ))}
        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <DesktopTableSkeleton rows={rows} />
      </div>
    </div>
  );
}

/** Default list-page loading state for CRM tables */
export function PageListSkeleton() {
  return <TablePageSkeleton />;
}
