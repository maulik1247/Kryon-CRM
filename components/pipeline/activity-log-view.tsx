"use client";

import * as React from "react";
import {
  Phone,
  Users,
  Mail,
  MapPin,
  StickyNote,
  ScrollText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { OpenFromUrl } from "@/components/shared/open-from-url";
import { TableActions } from "@/components/shared/table-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DealSheet } from "@/components/deals/deal-sheet";
import { ActivitySheet } from "@/components/pipeline/activity-sheet";
import { LogActivityDialog } from "@/components/pipeline/log-activity-dialog";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllActivitiesSorted } from "@/lib/deal-helpers";
import { filterActivitiesForUser, getUserName } from "@/lib/user-helpers";
import {
  ACTIVITY_TYPE_OPTIONS,
  getActivityTypeLabel,
} from "@/lib/activity-constants";
import type { Deal, DealActivityType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ACTIVITY_ICONS = {
  call: Phone,
  meeting: Users,
  email: Mail,
  visit: MapPin,
  note: StickyNote,
} as const;

export function ActivityLogView() {
  const { currentUser, isAdmin, users } = useAuth();
  const {
    dealActivities,
    deals,
    deleteDealActivity,
    getCustomerById,
    getContactById,
    getDealById,
  } = useCrmData();

  const [typeFilter, setTypeFilter] = React.useState<DealActivityType | "all">(
    "all"
  );
  const [selectedActivityId, setSelectedActivityId] = React.useState<
    string | null
  >(null);
  const [activitySheetOpen, setActivitySheetOpen] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [dealSheetOpen, setDealSheetOpen] = React.useState(false);

  const activities = React.useMemo(() => {
    const visible = filterActivitiesForUser(
      dealActivities,
      currentUser.id,
      isAdmin
    );
    const sorted = getAllActivitiesSorted(visible);
    if (typeFilter === "all") return sorted;
    return sorted.filter((activity) => activity.type === typeFilter);
  }, [dealActivities, typeFilter, currentUser.id, isAdmin]);

  const openActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
    setActivitySheetOpen(true);
  };

  const openActivityFromUrl = React.useCallback(
    (id: string) => openActivity(id),
    []
  );

  const openDeal = (dealId: string) => {
    const deal = getDealById(dealId);
    if (!deal) return;
    setSelectedDeal(deal);
    setDealSheetOpen(true);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          onOpen={openActivityFromUrl}
          canOpen={(id) => dealActivities.some((activity) => activity.id === id)}
        />
      </React.Suspense>

      <PageToolbar
        description="Record calls, visits, meetings, and notes against deals."
        meta={
          <span>
            <span className="font-medium text-foreground">
              {activities.length}
            </span>{" "}
            {activities.length === 1 ? "entry" : "entries"}
            {!isAdmin ? " for you" : ""}
            {typeFilter !== "all"
              ? ` · ${getActivityTypeLabel(typeFilter)} only`
              : ""}
          </span>
        }
        filters={
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as DealActivityType | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actions={<LogActivityDialog />}
      />

      <Card className="shadow-sm">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Recorded by</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0">
                      <EmptyState
                        icon={ScrollText}
                        title="No activity logged yet"
                        description="Capture customer conversations and field visits as they happen."
                        action={<LogActivityDialog />}
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type];
                    const deal = deals.find(
                      (entry) => entry.id === activity.dealId
                    );
                    const customer = deal
                      ? getCustomerById(deal.customerId)
                      : undefined;
                    const contact = activity.contactId
                      ? getContactById(activity.contactId)
                      : undefined;

                    return (
                      <TableRow
                        key={activity.id}
                        className="cursor-pointer"
                        onClick={() => openActivity(activity.id)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatDate(activity.occurredAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {getActivityTypeLabel(activity.type)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">
                          {customer?.name ?? "—"}
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap text-primary underline-offset-4 hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDeal(activity.dealId);
                          }}
                        >
                          {activity.dealId}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {contact?.name ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          {activity.summary}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-muted-foreground">
                          {activity.outcome ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {getUserName(users, activity.loggedByUserId)}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {activity.assignedToUserId
                            ? getUserName(users, activity.assignedToUserId)
                            : "—"}
                        </TableCell>
                        <TableCell
                          onClick={(event) => event.stopPropagation()}
                        >
                          <TableActions
                            onEdit={() => openActivity(activity.id)}
                            onDelete={() => deleteDealActivity(activity.id)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </MobileTableScroll>
        </Card>

      <ActivitySheet
        activityId={selectedActivityId}
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        onViewDeal={openDeal}
      />

      <DealSheet
        deal={selectedDeal}
        open={dealSheetOpen}
        onOpenChange={setDealSheetOpen}
      />
    </>
  );
}
