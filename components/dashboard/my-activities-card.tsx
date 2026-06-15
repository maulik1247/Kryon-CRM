"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Users,
  Mail,
  MapPin,
  StickyNote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivitySheet } from "@/components/pipeline/activity-sheet";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllActivitiesSorted } from "@/lib/deal-helpers";
import { getActivityTypeLabel } from "@/lib/activity-constants";
import { filterActivitiesForUser } from "@/lib/user-helpers";
import { formatDate } from "@/lib/utils";
import { ScrollText } from "lucide-react";

const ACTIVITY_ICONS = {
  call: Phone,
  meeting: Users,
  email: Mail,
  visit: MapPin,
  note: StickyNote,
} as const;

const ACTIVITY_PREVIEW_LIMIT = 5;

export function MyActivitiesCard() {
  const { currentUser, users } = useAuth();
  const { dealActivities, deals } = useCrmData();
  const [selectedActivityId, setSelectedActivityId] = React.useState<
    string | null
  >(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const activities = React.useMemo(() => {
    const visible = filterActivitiesForUser(dealActivities, deals, currentUser, users);
    return getAllActivitiesSorted(visible).slice(0, ACTIVITY_PREVIEW_LIMIT);
  }, [dealActivities, deals, currentUser, users]);

  const openActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
    setSheetOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ScrollText className="h-4 w-4" />
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity logged yet.
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => openActivity(activity.id)}
                    className="flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/40"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {activity.summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getActivityTypeLabel(activity.type)} ·{" "}
                        {formatDate(activity.occurredAt)} · {activity.dealId}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href="/activity-log">View activity log</Link>
          </Button>
        </CardContent>
      </Card>

      <ActivitySheet
        activityId={selectedActivityId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
