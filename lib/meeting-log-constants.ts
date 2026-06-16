import type {
  CustomerSentiment,
  DealActivityType,
  MeetingPurpose,
  VisitType,
} from "./types";
import { ACTIVITY_TYPE_OPTIONS } from "./activity-constants";

export const VISIT_TYPES: VisitType[] = [
  "In-Person",
  "Virtual / Video Call",
  "Phone Call",
  "Factory / Plant Visit",
  "Trade Show / Expo",
  "Customer Office",
  "Other",
];

export const MEETING_PURPOSES: MeetingPurpose[] = [
  "Discovery",
  "Follow-up",
  "Sample Review",
  "Negotiation",
  "Plant Audit",
  "Technical Review",
  "Pricing Discussion",
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

export const MEETING_LOG_RECORD_TYPE_OPTIONS = ACTIVITY_TYPE_OPTIONS;

export const MEETING_LOG_RECORD_TYPES: DealActivityType[] =
  MEETING_LOG_RECORD_TYPE_OPTIONS.map((option) => option.value);

/** @deprecated use MEETING_LOG_RECORD_TYPES */
export const MEETING_ACTIVITY_TYPES = MEETING_LOG_RECORD_TYPES;

export function isMeetingLogActivity(type: DealActivityType): boolean {
  return MEETING_LOG_RECORD_TYPES.includes(type);
}

export function showsVisitFormatFields(type: DealActivityType): boolean {
  return type === "visit" || type === "meeting" || type === "call";
}

export function getDefaultDateTimeLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function splitActivityDateTime(value?: string) {
  if (!value) {
    const defaults = getDefaultDateTimeLocal();
    const [date, time] = defaults.split("T");
    return { date: date ?? "", time: time ?? "10:00" };
  }

  if (value.includes("T")) {
    const [date, timePart] = value.split("T");
    return {
      date: date ?? "",
      time: (timePart ?? "10:00").slice(0, 5),
    };
  }

  return { date: value, time: "10:00" };
}

export function combineActivityDateTime(date: string, time: string) {
  const normalizedTime = time || "10:00";
  return `${date}T${normalizedTime}`;
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
