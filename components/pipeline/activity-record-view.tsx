"use client";

import { ActivityForm } from "@/components/pipeline/activity-form";
import { RecordNotFound } from "@/components/records/record-not-found";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { canUserAccessActivity } from "@/lib/user-helpers";
import { recordListRoutes } from "@/lib/record-routes";

export function ActivityRecordView({ activityId }: { activityId: string }) {
  const { currentUser, users } = useAuth();
  const { dealActivities, deals } = useCrmData();
  const activity = dealActivities.find((entry) => entry.id === activityId);

  const hasAccess =
    activity &&
    canUserAccessActivity(activity, deals, currentUser, users);

  if (!activity || !hasAccess) {
    return (
      <RecordNotFound
        backHref={recordListRoutes.activity}
        backLabel="activity log"
      />
    );
  }

  return <ActivityForm activityId={activityId} />;
}
