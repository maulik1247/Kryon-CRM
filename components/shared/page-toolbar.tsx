import { cn } from "@/lib/utils";

interface PageToolbarProps {
  description?: string;
  meta?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageToolbar({
  description,
  meta,
  filters,
  actions,
  className,
}: PageToolbarProps) {
  if (!description && !meta && !filters && !actions) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm transition-smooth",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {meta ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {meta}
            </div>
          ) : null}
        </div>

        {(filters || actions) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {filters}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
