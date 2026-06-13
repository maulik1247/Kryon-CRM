import type { ConfidenceLevel } from "./types";
import type { BadgeVariant } from "./badge-variants";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  100: "100%",
  75: "75%",
  50: "50%",
  25: "25%",
  0: "0%",
};

export const CONFIDENCE_VARIANT: Record<ConfidenceLevel, BadgeVariant> = {
  100: "default",
  75: "secondary",
  50: "outline",
  25: "outline",
  0: "outline",
};

export function getConfidenceLabel(level: ConfidenceLevel) {
  return CONFIDENCE_LABELS[level] ?? `${level}%`;
}
