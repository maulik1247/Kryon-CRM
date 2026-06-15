import type {
  CustomerSentiment,
  DealActivityType,
  MeetingPurpose,
  VisitType,
} from "./types";

export const VISIT_TYPES: VisitType[] = [
  "In-Person",
  "Virtual / Video Call",
  "Phone Call",
];

export const MEETING_PURPOSES: MeetingPurpose[] = [
  "Discovery",
  "Follow-up",
  "Sample Review",
  "Negotiation",
  "Plant Audit",
  "Relationship",
  "Other",
];

export const CUSTOMER_SENTIMENTS: CustomerSentiment[] = [
  "Very Positive",
  "Positive",
  "Neutral",
  "Negative",
  "Very Negative",
];

export const MEETING_ACTIVITY_TYPES: DealActivityType[] = ["visit", "meeting"];

export function isMeetingLogActivity(type: DealActivityType): boolean {
  return type === "visit" || type === "meeting";
}

export function getDefaultDateTimeLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatActivityDateTime(value: string): string {
  if (!value) return "—";
  if (value.includes("T")) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return value;
}
