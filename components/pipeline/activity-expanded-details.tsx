import { DetailGrid } from "@/components/shared/detail-grid";
import { getActivityTypeLabel } from "@/lib/activity-constants";
import { getConfidenceLabel } from "@/lib/confidence-constants";
import { formatActivityDateTime, isMeetingLogActivity, showsVisitFormatFields } from "@/lib/meeting-log-constants";
import type { DealActivity } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ActivityExpandedDetailsProps {
  activity: DealActivity;
  customerName?: string;
  contactName?: string;
  recordedBy: string;
  assignedTo?: string;
  competitorName?: string;
  ourAttendeeNames?: string;
}

export function ActivityExpandedDetails({
  activity,
  customerName,
  contactName,
  recordedBy,
  assignedTo,
  competitorName,
  ourAttendeeNames,
}: ActivityExpandedDetailsProps) {
  const isMeeting = isMeetingLogActivity(activity.type);

  const items = isMeeting
    ? [
        {
          label: "Date & time",
          value: formatActivityDateTime(activity.occurredAt),
        },
        { label: "Type", value: getActivityTypeLabel(activity.type) },
        ...(showsVisitFormatFields(activity.type)
          ? [
              { label: "Visit type", value: activity.visitType },
              { label: "Purpose", value: activity.purpose },
            ]
          : []),
        { label: "Customer", value: customerName },
        { label: "Deal", value: activity.dealId, mono: true },
        { label: "Our attendees", value: ourAttendeeNames },
        {
          label: "Customer attendees",
          value: activity.customerAttendees
            ?.map(
              (attendee) =>
                `${attendee.name} (${attendee.designation}, ${attendee.department})`
            )
            .join("; "),
          className: "col-span-2",
        },
        {
          label: "Discussion summary",
          value: activity.summary,
          className: "col-span-2",
        },
        {
          label: "Key decisions",
          value: activity.keyDecisions,
          className: "col-span-2",
        },
        {
          label: "Action items",
          value: activity.actionItems
            ?.map((item) => item.description)
            .join("; "),
          className: "col-span-2",
        },
        {
          label: "Confidence updated",
          value:
            activity.confidenceUpdated !== undefined
              ? getConfidenceLabel(activity.confidenceUpdated)
              : undefined,
        },
        { label: "Customer sentiment", value: activity.customerSentiment },
        { label: "Competitor discussed", value: competitorName },
        {
          label: "Attachments",
          value: activity.attachments?.map((file) => file.name).join(", "),
        },
        {
          label: "Next follow-up",
          value: activity.nextFollowUpDate,
        },
        { label: "Added on", value: formatDate(activity.createdAt) },
        { label: "Added by", value: recordedBy },
      ]
    : [
        { label: "Date", value: formatActivityDateTime(activity.occurredAt) },
        { label: "Type", value: getActivityTypeLabel(activity.type) },
        { label: "Customer", value: customerName },
        { label: "Deal", value: activity.dealId, mono: true },
        { label: "Contact", value: contactName },
        { label: "Summary", value: activity.summary, className: "col-span-2" },
        { label: "Outcome", value: activity.outcome, className: "col-span-2" },
        { label: "Added on", value: formatDate(activity.createdAt) },
        { label: "Added by", value: recordedBy },
        { label: "Assigned to", value: assignedTo },
      ];

  return <DetailGrid items={items} />;
}
