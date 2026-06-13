import type { AnnualRevenueRange, VendorStatus } from "./types";
import { DEFAULT_MASTER_DATA } from "./default-master-data";

export const OEM_SEGMENTS = DEFAULT_MASTER_DATA.oemSegments;
export const LEAD_SOURCES = DEFAULT_MASTER_DATA.leadSources;
export const ACCOUNT_OWNERS = DEFAULT_MASTER_DATA.accountOwners;

export const ANNUAL_REVENUE_RANGES: AnnualRevenueRange[] = [
  "< 100 Cr",
  "100-500 Cr",
  "500-1000 Cr",
  "1000-5000 Cr",
  "> 5000 Cr",
];

export const VENDOR_STATUSES: VendorStatus[] = [
  "Not Started",
  "In Process",
  "Approved",
  "Rejected",
];

export const PRIORITIES = [
  { value: "A", label: "A (Strategic)" },
  { value: "B", label: "B (High)" },
  { value: "C", label: "C (Regular)" },
] as const;

export const TIERS = ["Tier 1", "Tier 2", "Tier 3"] as const;

const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstin(gstin: string): boolean {
  const value = gstin.trim().toUpperCase();
  if (!value) return true;
  return GSTIN_PATTERN.test(value);
}

export function formatLeadDate(date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export const PRIORITY_LABELS: Record<string, string> = {
  A: "A (Strategic)",
  B: "B (High)",
  C: "C (Regular)",
};
