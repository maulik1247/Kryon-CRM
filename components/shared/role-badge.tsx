import { Badge } from "@/components/ui/badge";
import type { BuyingRole } from "@/lib/types";
import type { BadgeVariant } from "@/lib/badge-variants";

const roleVariant: Record<BuyingRole, BadgeVariant> = {
  "Decision Maker": "default",
  Influencer: "secondary",
  Champion: "outline",
  Gatekeeper: "secondary",
  User: "outline",
};

export function RoleBadge({ role }: { role: BuyingRole }) {
  return (
    <Badge variant={roleVariant[role]} className="text-xs">
      {role}
    </Badge>
  );
}
