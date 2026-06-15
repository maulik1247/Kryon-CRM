import type { ConfidenceLevel } from "./types";
import type { BadgeVariant } from "./badge-variants";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  100: "100% confident",
  75: "75% confident",
  50: "50% confident",
  25: "25% confident",
  0: "Not confident",
};

export const CONFIDENCE_FORM_OPTIONS: {
  value: `${ConfidenceLevel}`;
  label: string;
}[] = [
  { value: "100", label: "100% confident" },
  { value: "75", label: "75% confident" },
  { value: "50", label: "50% confident" },
  { value: "25", label: "25% confident" },
  { value: "0", label: "Not confident" },
];

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
