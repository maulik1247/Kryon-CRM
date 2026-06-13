import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DetailGridProps {
  items: {
    label: string;
    value?: string;
    children?: React.ReactNode;
    mono?: boolean;
    emphasis?: boolean;
    className?: string;
  }[];
  columns?: 1 | 2;
}

export function DetailGrid({ items, columns = 2 }: DetailGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 text-sm",
        columns === 2 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {items.map((item) => (
        <div key={item.label} className={item.className}>
          <Label className="text-xs font-normal text-muted-foreground">
            {item.label}
          </Label>
          <p
            className={cn(
              "mt-1 font-medium",
              item.mono && "text-xs tracking-tight",
              item.emphasis && "font-display font-semibold"
            )}
          >
            {item.children ?? item.value ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
