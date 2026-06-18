import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70",
        "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:animate-skeleton-shimmer before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:content-['']",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
