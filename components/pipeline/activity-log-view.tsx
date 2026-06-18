"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Users,
  Mail,
  MapPin,
  StickyNote,
  ScrollText,
  Plus,
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
import { Button } from "@/components/ui/button";
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
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useRecordNavigation } from "@/hooks/use-record-navigation";
import { ActivityMobileList } from "@/components/pipeline/activity-mobile-list";
import { canViewAllDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getAllActivitiesSorted } from "@/lib/deal-helpers";
import { filterActivitiesForUser, canUserAccessActivity, getUserName } from "@/lib/user-helpers";
import { recordNewRoutes, recordRoutes } from "@/lib/record-routes";
import {
  ACTIVITY_TYPE_OPTIONS,
  getActivityTypeLabel,
} from "@/lib/activity-constants";
import type { DealActivityType } from "@/lib/types";
import { formatActivityDateTime } from "@/lib/meeting-log-constants";
import { formatDate } from "@/lib/utils";
import { RecordIdText } from "@/components/shared/record-id";

const ACTIVITY_ICONS = {
  call: Phone,
  meeting: Users,
  email: Mail,
  visit: MapPin,
  note: StickyNote,
} as const;

export function ActivityLogView() {
  const { currentUser, users } = useAuth();
  const seesAllDeals = canViewAllDeals(currentUser.role);
  const {
    dealActivities,
    deals,
    deleteDealActivity,
    getCustomerById,
    getContactById,
    getSupplierById,
  } = useCrmData();
  const { goToActivity, goToDeal } = useRecordNavigation();

  const [typeFilter, setTypeFilter] = React.useState<DealActivityType | "all">(
    "all"
  );
  const [deleteActivityId, setDeleteActivityId] = React.useState<string | null>(
    null
  );

  const activities = React.useMemo(() => {
    const visible = filterActivitiesForUser(dealActivities, deals, currentUser, users);
    const sorted = getAllActivitiesSorted(visible);
    if (typeFilter === "all") return sorted;
    return sorted.filter((activity) => activity.type === typeFilter);
  }, [dealActivities, deals, typeFilter, currentUser, users]);

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
  } = usePagination(activities, 10, typeFilter);

  const openDeal = (dealId: string) => {
    goToDeal(dealId);
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <OpenFromUrl
          getHref={recordRoutes.activity}
          canOpen={(id) => {
            const activity = dealActivities.find((entry) => entry.id === id);
            return activity
              ? canUserAccessActivity(activity, deals, currentUser, users)
              : false;
          }}
        />
      </React.Suspense>

      <PageToolbar
        description="Log visits and meetings with full attendee and follow-up details."
        meta={
          <span>
            <span className="font-medium text-foreground">
              {activities.length}
            </span>{" "}
            {activities.length === 1 ? "entry" : "entries"}
            {!seesAllDeals ? " for you" : ""}
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
        actions={
          <Button asChild>
            <Link href={recordNewRoutes.activity}>
              <Plus className="h-4 w-4" />
              Log Activity
            </Link>
          </Button>
        }
      />

      {activities.length === 0 ? (
        <div className="md:hidden">
          <EmptyState
            icon={ScrollText}
            title="No activity yet"
            description="Log calls, meetings, and visits to keep deals moving."
            action={
              <Button asChild>
                <Link href={recordNewRoutes.activity}>
                  <Plus className="h-4 w-4" />
                  Log Activity
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <ActivityMobileList
            activities={paginatedItems}
            icons={ACTIVITY_ICONS}
            customerName={(dealId) => {
              const deal = deals.find((entry) => entry.id === dealId);
              return deal ? getCustomerById(deal.customerId)?.name : undefined;
            }}
            contactName={(contactId) =>
              contactId ? getContactById(contactId)?.name : undefined
            }
            recordedBy={(userId) => getUserName(users, userId)}
            assignedTo={(userId) =>
              userId ? getUserName(users, userId) : undefined
            }
            competitorName={(supplierId) =>
              supplierId ? getSupplierById(supplierId)?.name : undefined
            }
            ourAttendeeNames={(userIds) =>
              userIds
                ?.map((userId) => getUserName(users, userId))
                .filter(Boolean)
                .join(", ")
            }
            onOpen={goToActivity}
            onOpenDeal={openDeal}
            onDelete={setDeleteActivityId}
          />
          {totalItems > 0 ? (
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm md:hidden">
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </>
      )}

      <Card className="hidden overflow-hidden shadow-sm md:block">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Added on</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead className="w-[88px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="p-0">
                      <EmptyState
                        icon={ScrollText}
                        title="No activity logged yet"
                        description="Capture customer conversations and field visits as they happen."
                        action={
              <Button asChild>
                <Link href={recordNewRoutes.activity}>
                  <Plus className="h-4 w-4" />
                  Log Activity
                </Link>
              </Button>
            }
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((activity) => {
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
                        onClick={() => goToActivity(activity.id)}
                      >
                        <TableCell>
                          <RecordIdText id={activity.id} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatActivityDateTime(activity.occurredAt)}
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
                          {activity.keyDecisions ?? activity.outcome ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {activity.assignedToUserId
                            ? getUserName(users, activity.assignedToUserId)
                            : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(activity.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {getUserName(users, activity.loggedByUserId)}
                        </TableCell>
                        <TableCell
                          onClick={(event) => event.stopPropagation()}
                        >
                          <TableActions
                            onEdit={() => goToActivity(activity.id)}
                            onDelete={() => setDeleteActivityId(activity.id)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </MobileTableScroll>
          {totalItems > 0 ? (
            <TablePagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          ) : null}
        </Card>

      <DeleteConfirmDialog
        open={!!deleteActivityId}
        onOpenChange={(open) => {
          if (!open) setDeleteActivityId(null);
        }}
        title="Delete activity?"
        description="This will permanently remove this activity log entry."
        onConfirm={() => {
          if (!deleteActivityId) return;
          deleteDealActivity(deleteActivityId);
          setDeleteActivityId(null);
        }}
      />
    </>
  );
}
