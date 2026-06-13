import type { VendorStatus } from "./types";
import type { BadgeVariant } from "./badge-variants";

export function getVendorStatusVariant(status: VendorStatus): BadgeVariant {
  switch (status) {
    case "Approved":
      return "default";
    case "In Process":
      return "secondary";
    case "Rejected":
      return "destructive";
    case "Not Started":
      return "outline";
  }
}
