import type { BuyingRole, ContactDepartment } from "@/lib/types";

export const CONTACT_DEPARTMENTS: ContactDepartment[] = [
  "R&D",
  "Purchase",
  "Vendor Development",
  "Quality",
  "Management",
  "Operations",
  "Finance",
  "Other",
];

export const BUYING_ROLES: BuyingRole[] = [
  "Decision Maker",
  "Influencer",
  "Gatekeeper",
  "User",
  "Champion",
];

export const PRIMARY_CONTACT_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;
