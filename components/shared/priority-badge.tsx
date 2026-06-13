import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/customer-constants";
import type { Priority } from "@/lib/types";
import type { BadgeVariant } from "@/lib/badge-variants";

const priorityVariant: Record<Priority, BadgeVariant> = {
  A: "default",
  B: "secondary",
  C: "outline",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant={priorityVariant[priority]} className="font-semibold">
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
