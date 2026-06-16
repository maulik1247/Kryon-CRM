"use client";

import type { LucideIcon } from "lucide-react";
import { TableActions } from "@/components/shared/table-actions";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import { getActivityTypeLabel } from "@/lib/activity-constants";
import { ActivityExpandedDetails } from "./activity-expanded-details";
import type { DealActivity, DealActivityType } from "@/lib/types";
import { formatActivityDateTime } from "@/lib/meeting-log-constants";
import { formatDate } from "@/lib/utils";

interface ActivityMobileListProps {
  activities: DealActivity[];
  icons: Record<DealActivityType, LucideIcon>;
  customerName: (dealId: string) => string | undefined;
  contactName: (contactId?: string) => string | undefined;
  recordedBy: (userId: string) => string;
  assignedTo: (userId?: string) => string | undefined;
  competitorName?: (supplierId?: string) => string | undefined;
  ourAttendeeNames?: (userIds?: string[]) => string | undefined;
  onOpen: (activityId: string) => void;
  onOpenDeal: (dealId: string) => void;
  onDelete: (activityId: string) => void;
}

export function ActivityMobileList({
  activities,
  icons,
  customerName,
  contactName,
  recordedBy,
  assignedTo,
  competitorName,
  ourAttendeeNames,
  onOpen,
  onOpenDeal,
  onDelete,
}: ActivityMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {activities.map((activity) => {
        const Icon = icons[activity.type];

        return (
          <ExpandableMobileCard
            key={activity.id}
            id={activity.id}
            expandedId={expandedId}
            onToggle={toggleExpanded}
            summary={
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{activity.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatActivityDateTime(activity.occurredAt)} · Added on{" "}
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {getActivityTypeLabel(activity.type)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {customerName(activity.dealId) ?? activity.dealId}
                </p>
              </div>
            }
            details={
              <ActivityExpandedDetails
                activity={activity}
                customerName={customerName(activity.dealId)}
                contactName={contactName(activity.contactId)}
                recordedBy={recordedBy(activity.loggedByUserId)}
                assignedTo={assignedTo(activity.assignedToUserId)}
                competitorName={competitorName?.(activity.competitorSupplierId)}
                ourAttendeeNames={ourAttendeeNames?.(activity.ourAttendeeIds)}
              />
            }
            actions={
              <TableActions
                onEdit={() => onOpen(activity.id)}
                onDelete={() => onDelete(activity.id)}
              />
            }
          />
        );
      })}
    </div>
  );
}
