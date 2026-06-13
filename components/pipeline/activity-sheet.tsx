"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { UserAssigneeSelect } from "@/components/shared/user-assignee-select";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { ACTIVITY_TYPE_OPTIONS, getActivityTypeLabel } from "@/lib/activity-constants";
import { getUserName, isAssignableActivityType } from "@/lib/user-helpers";
import type { DealActivity, DealActivityType } from "@/lib/types";

interface ActivitySheetProps {
  activityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDeal?: (dealId: string) => void;
}

interface ActivityFormState {
  type: DealActivityType;
  occurredAt: string;
  dealId: string;
  contactId: string;
  summary: string;
  outcome: string;
  assignedToUserId: string;
}

function activityToForm(activity: DealActivity): ActivityFormState {
  return {
    type: activity.type,
    occurredAt: activity.occurredAt,
    dealId: activity.dealId,
    contactId: activity.contactId ?? "",
    summary: activity.summary,
    outcome: activity.outcome ?? "",
    assignedToUserId:
      activity.assignedToUserId ?? activity.loggedByUserId,
  };
}

export function ActivitySheet({
  activityId,
  open,
  onOpenChange,
  onViewDeal,
}: ActivitySheetProps) {
  const { currentUser, isAdmin, users } = useAuth();
  const {
    dealActivities,
    deals,
    updateDealActivity,
    deleteDealActivity,
    getCustomerById,
    getDealById,
    getContactsByCustomerId,
  } = useCrmData();

  const activity = activityId
    ? dealActivities.find((entry) => entry.id === activityId)
    : undefined;

  const [form, setForm] = React.useState<ActivityFormState>({
    type: "call",
    occurredAt: new Date().toISOString().split("T")[0],
    dealId: "",
    contactId: "",
    summary: "",
    outcome: "",
    assignedToUserId: currentUser.id,
  });

  React.useEffect(() => {
    if (open && activity) {
      setForm(activityToForm(activity));
    }
  }, [open, activity]);

  const update = <K extends keyof ActivityFormState>(
    field: K,
    value: ActivityFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const deal = getDealById(form.dealId);
  const customer = deal ? getCustomerById(deal.customerId) : undefined;
  const contacts = deal ? getContactsByCustomerId(deal.customerId) : [];
  const showAssignee = isAdmin && isAssignableActivityType(form.type);

  const handleDealChange = (dealId: string) => {
    const nextDeal = getDealById(dealId);
    const nextContacts = nextDeal
      ? getContactsByCustomerId(nextDeal.customerId)
      : [];

    setForm((prev) => ({
      ...prev,
      dealId,
      contactId: nextContacts[0]?.id ?? "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !form.summary.trim() || !form.dealId) return;

    const assigneeId = showAssignee ? form.assignedToUserId : undefined;

    updateDealActivity(activity.id, {
      type: form.type,
      occurredAt: form.occurredAt,
      dealId: form.dealId,
      contactId: form.contactId || undefined,
      summary: form.summary.trim(),
      outcome: form.outcome.trim() || undefined,
      assignedToUserId:
        assigneeId && assigneeId !== activity.loggedByUserId
          ? assigneeId
          : undefined,
      recorderName: currentUser.name,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!activity) return;
    deleteDealActivity(activity.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">
            {activity ? getActivityTypeLabel(activity.type) : "Activity"}
          </SheetTitle>
          <SheetDescription>
            {customer?.name ?? "Customer"} · {form.dealId || "—"}
          </SheetDescription>
        </SheetHeader>

        {activity ? (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <FormField label="Type" htmlFor="activity-type">
                <FormSelect
                  id="activity-type"
                  value={form.type}
                  onValueChange={(value) =>
                    update("type", value as DealActivityType)
                  }
                  options={ACTIVITY_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </FormField>

              <FormField label="Date" htmlFor="activity-date">
                <DatePicker
                  value={form.occurredAt}
                  onChange={(value) => update("occurredAt", value)}
                  placeholder="When it happened"
                />
              </FormField>

              <FormField label="Deal" htmlFor="activity-deal">
                <FormSelect
                  id="activity-deal"
                  value={form.dealId}
                  onValueChange={handleDealChange}
                  disabled={deals.length === 0}
                  placeholder="Select deal"
                  options={deals.map((entry) => {
                    const dealCustomer = getCustomerById(entry.customerId);
                    return {
                      value: entry.id,
                      label: `${dealCustomer?.name ?? "Unknown"} · ${entry.id}`,
                    };
                  })}
                />
              </FormField>

              {onViewDeal && form.dealId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onViewDeal(form.dealId)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View linked deal
                </Button>
              ) : null}

              {contacts.length > 0 ? (
                <FormField label="Contact" htmlFor="activity-contact">
                  <FormSelect
                    id="activity-contact"
                    value={form.contactId}
                    onValueChange={(value) => update("contactId", value)}
                    placeholder="Who you spoke with"
                    options={contacts.map((contact) => ({
                      value: contact.id,
                      label: contact.name,
                    }))}
                  />
                </FormField>
              ) : null}

              <FormField label="Summary" htmlFor="activity-summary">
                <Textarea
                  id="activity-summary"
                  rows={3}
                  required
                  value={form.summary}
                  onChange={(e) => update("summary", e.target.value)}
                />
              </FormField>

              <FormField label="Outcome" htmlFor="activity-outcome">
                <Textarea
                  id="activity-outcome"
                  rows={2}
                  placeholder="Next steps or result (optional)"
                  value={form.outcome}
                  onChange={(e) => update("outcome", e.target.value)}
                />
              </FormField>

              <FormField label="Recorded by" htmlFor="activity-recorded-by">
                <p
                  id="activity-recorded-by"
                  className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                >
                  {getUserName(users, activity.loggedByUserId)}
                </p>
              </FormField>

              {showAssignee ? (
                <UserAssigneeSelect
                  id="activity-assignee"
                  label="Assigned to"
                  value={form.assignedToUserId}
                  onValueChange={(value) => update("assignedToUserId", value)}
                />
              ) : null}
            </div>

            <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  disabled={!form.summary.trim() || !form.dealId}
                >
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
