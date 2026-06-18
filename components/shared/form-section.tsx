import { cn } from "@/lib/utils";

export const formSectionTitleClassName =
  "font-display text-sm font-semibold tracking-tight text-foreground";

export function FormSections({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-5", className)}>{children}</div>;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const hasHeader = Boolean(title || description);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
        className
      )}
    >
      {hasHeader ? (
        <div className="border-b border-border/50 bg-muted/20 px-5 py-3.5 sm:px-6">
          {title ? (
            <h3 className={formSectionTitleClassName}>{title}</h3>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                title ? "mt-0.5" : undefined
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={cn("space-y-4 p-5 sm:p-6", !hasHeader && "pt-5")}>
        {children}
      </div>
    </section>
  );
}
