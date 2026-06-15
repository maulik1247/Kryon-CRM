import type {
  DocumentDirection,
  DocumentExchangeStatus,
  DocumentExchangeType,
  SignedCopyStatus,
} from "@/lib/types";

export const DOCUMENT_EXCHANGE_TYPES: DocumentExchangeType[] = [
  "NDA (Mutual)",
  "NDA (One-way)",
  "Technical Spec Sheet",
  "Product Datasheet",
  "Vendor Registration Form",
  "BIS Certificate",
  "Test Report",
  "Brochure / Catalog",
  "Other",
];

export const DOCUMENT_DIRECTIONS: DocumentDirection[] = [
  "Sent to Customer",
  "Received from Customer",
];

export const DOCUMENT_EXCHANGE_STATUSES: DocumentExchangeStatus[] = [
  "Draft",
  "Sent",
  "Signed",
  "Expired",
];

export const SIGNED_COPY_STATUSES: SignedCopyStatus[] = [
  "Yes",
  "No",
  "Pending",
];

export function getDocumentExchangeStatusVariant(
  status: DocumentExchangeStatus
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Signed":
      return "default";
    case "Sent":
      return "secondary";
    case "Expired":
      return "destructive";
    default:
      return "outline";
  }
}
