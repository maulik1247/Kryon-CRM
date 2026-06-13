import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6 page-enter">
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
        <Skeleton className="h-4 w-64 max-w-full" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
