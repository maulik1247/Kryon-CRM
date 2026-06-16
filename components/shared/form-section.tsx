import { cn } from "@/lib/utils";

export const formSectionTitleClassName =
  "font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground";

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
    <section className={cn("space-y-4", className)}>
      {hasHeader ? (
        <div>
          {title ? (
            <h3 className={formSectionTitleClassName}>{title}</h3>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-xs text-muted-foreground",
                title ? "mt-0.5" : undefined
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
