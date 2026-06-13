import { DetailGrid } from "@/components/shared/detail-grid";
import { getActivityTypeLabel } from "@/lib/activity-constants";
import type { DealActivity } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ActivityExpandedDetailsProps {
  activity: DealActivity;
  customerName?: string;
  contactName?: string;
  recordedBy: string;
  assignedTo?: string;
}

export function ActivityExpandedDetails({
  activity,
  customerName,
  contactName,
  recordedBy,
  assignedTo,
}: ActivityExpandedDetailsProps) {
  return (
    <DetailGrid
      items={[
        { label: "Date", value: formatDate(activity.occurredAt) },
        { label: "Type", value: getActivityTypeLabel(activity.type) },
        { label: "Customer", value: customerName },
        { label: "Deal", value: activity.dealId, mono: true },
        { label: "Contact", value: contactName },
        { label: "Summary", value: activity.summary, className: "col-span-2" },
        { label: "Outcome", value: activity.outcome, className: "col-span-2" },
        { label: "Recorded by", value: recordedBy },
        { label: "Assigned to", value: assignedTo },
      ]}
    />
  );
}
