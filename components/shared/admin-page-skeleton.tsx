import { Skeleton } from "@/components/ui/skeleton";
import { TablePageSkeleton } from "@/components/shared/page-list-skeleton";

export function AdminPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid h-auto w-full grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-1">
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsersSkeleton() {
  return <TablePageSkeleton rows={5} />;
}
