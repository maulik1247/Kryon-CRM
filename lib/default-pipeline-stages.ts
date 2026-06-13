import type { PipelineStageConfig } from "./types";

export const DEFAULT_PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: "lead-hot", name: "Lead - Hot", color: "#f43f5e", kind: "open" },
  { id: "lead-cold", name: "Lead - Cold", color: "#0ea5e9", kind: "open" },
  { id: "discussion", name: "Discussion", color: "#6366f1", kind: "open" },
  { id: "nda", name: "NDA", color: "#818cf8", kind: "open" },
  {
    id: "sample-submitted",
    name: "Sample Submitted",
    color: "#8b5cf6",
    kind: "open",
  },
  { id: "testing", name: "Testing", color: "#a78bfa", kind: "open" },
  {
    id: "commercial-negotiation",
    name: "Commercial Negotiation",
    color: "#f59e0b",
    kind: "open",
  },
  { id: "pfi-sent", name: "PFI Sent", color: "#fbbf24", kind: "open" },
  { id: "po-received", name: "PO Received", color: "#14b8a6", kind: "open" },
  { id: "closed-won", name: "Closed Won", color: "#10b981", kind: "won" },
  { id: "closed-lost", name: "Closed Lost", color: "#737373", kind: "lost" },
];

const LEGACY_STAGE_IDS: Record<string, string> = {
  "Lead - Hot": "lead-hot",
  "Lead - Cold": "lead-cold",
  Discussion: "discussion",
  NDA: "nda",
  "Sample Submitted": "sample-submitted",
  Testing: "testing",
  "Commercial Negotiation": "commercial-negotiation",
  "PFI Sent": "pfi-sent",
  "PO Received": "po-received",
  "Closed Won": "closed-won",
  "Closed Lost": "closed-lost",
};

export function normalizeStageId(
  stage: string,
  stages: PipelineStageConfig[]
): string {
  const ids = new Set(stages.map((s) => s.id));
  if (ids.has(stage)) return stage;

  const legacyId = LEGACY_STAGE_IDS[stage];
  if (legacyId && ids.has(legacyId)) return legacyId;

  const byName = stages.find((s) => s.name === stage);
  if (byName) return byName.id;

  return stages[0]?.id ?? stage;
}

export function slugifyStageId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
