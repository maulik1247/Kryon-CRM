"use client";

import { cn } from "@/lib/utils";

export function MobileTableScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] md:mx-0 md:overflow-visible md:px-0",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
