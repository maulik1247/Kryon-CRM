import type { DealActivityType } from "./types";

export const ACTIVITY_TYPE_OPTIONS: {
  value: DealActivityType;
  label: string;
}[] = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "email", label: "Email" },
  { value: "visit", label: "Visit" },
  { value: "note", label: "Note" },
];

export function getActivityTypeLabel(type: DealActivityType) {
  return ACTIVITY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
