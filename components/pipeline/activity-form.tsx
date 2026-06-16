"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { FormSection } from "@/components/shared/form-section";
import { MeetingLogForm } from "@/components/activity/meeting-log-form";
import { RecordFormPage } from "@/components/records/record-form-page";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { ACTIVITY_TYPE_OPTIONS } from "@/lib/activity-constants";
import { isMeetingLogActivity } from "@/lib/meeting-log-constants";
import {
  filterDealsForUser,
  canUserAccessActivity,
  getUserName,
} from "@/lib/user-helpers";
import { recordListRoutes, recordRoutes } from "@/lib/record-routes";
import type { DealActivity, DealActivityType } from "@/lib/types";

interface SimpleActivityFormState {
  type: DealActivityType;
  occurredAt: string;
  dealId: string;
  contactId: string;
  summary: string;
  outcome: string;
}

function activityToSimpleForm(activity: DealActivity): SimpleActivityFormState {
  return {
    type: activity.type,
    occurredAt: activity.occurredAt.split("T")[0] ?? activity.occurredAt,
    dealId: activity.dealId,
    contactId: activity.contactId ?? "",
    summary: activity.summary,
    outcome: activity.outcome ?? "",
  };
}

interface ActivityFormProps {
  activityId?: string;
  defaultDealId?: string;
}

function ActivityFormHeader({
  backHref,
  backLabel,
  title,
  description,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 px-2 text-muted-foreground"
        asChild
      >
        <Link href={backHref}>← {backLabel}</Link>
      </Button>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ActivityForm({ activityId, defaultDealId }: ActivityFormProps) {
  const router = useRouter();
  const { currentUser, users } = useAuth();
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
  const isAdd = !activityId;

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const hasAccess =
    isAdd ||
    (activity &&
      canUserAccessActivity(activity, deals, currentUser, users));

  const isMeetingLog = activity ? isMeetingLogActivity(activity.type) : true;
  const formId = isAdd ? "log-activity-form" : "edit-activity-form";

  const [form, setForm] = React.useState<SimpleActivityFormState>({
    type: "call",
    occurredAt: new Date().toISOString().split("T")[0],
    dealId: "",
    contactId: "",
    summary: "",
    outcome: "",
  });

  React.useEffect(() => {
    if (activity && !isMeetingLogActivity(activity.type)) {
      setForm(activityToSimpleForm(activity));
    }
  }, [activity]);

  const update = <K extends keyof SimpleActivityFormState>(
    field: K,
    value: SimpleActivityFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const deal = getDealById(form.dealId);
  const contacts = deal ? getContactsByCustomerId(deal.customerId) : [];

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

  const handleSimpleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activity || !form.summary.trim() || !form.dealId) return;

    updateDealActivity(activity.id, {
      type: form.type,
      occurredAt: form.occurredAt,
      dealId: form.dealId,
      contactId: form.contactId || undefined,
      summary: form.summary.trim(),
      outcome: form.outcome.trim() || undefined,
      recorderName: currentUser.name,
    });

    router.push(recordListRoutes.activity);
  };

  const handleDelete = () => {
    if (!activity) return;
    deleteDealActivity(activity.id);
    router.push(recordListRoutes.activity);
  };

  const handleMeetingSaved = () => {
    router.push(recordListRoutes.activity);
  };

  const viewDeal = (dealId: string) => {
    router.push(recordRoutes.deal(dealId));
  };

  if (!hasAccess) {
    return null;
  }

  if (!isAdd && !activity) {
    return null;
  }

  const title = isAdd ? "Log Activity" : "Edit Activity";
  const description = isAdd
    ? "Record visits, meetings, calls, emails, and notes with follow-up details."
    : "Update activity details and follow-up information.";

  if (isAdd || isMeetingLog) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <ActivityFormHeader
          backHref={recordListRoutes.activity}
          backLabel="Activity log"
          title={title}
          description={description}
        />

        <Card className="space-y-4 border-border/60 p-6 shadow-sm">
          <MeetingLogForm
            activity={activity}
            defaultDealId={defaultDealId}
            formId={formId}
            hideActions
            submitLabel={isAdd ? "Save log" : "Save Changes"}
            onViewDeal={viewDeal}
            onSaved={handleMeetingSaved}
          />
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {!isAdd ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.activity}>Cancel</Link>
            </Button>
            <Button type="submit" form={formId}>
              {isAdd ? "Save log" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RecordFormPage
      backHref={recordListRoutes.activity}
      backLabel="Activity log"
      title={title}
      description={description}
      onSubmit={handleSimpleSubmit}
      footer={
        <>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={recordListRoutes.activity}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!form.summary.trim() || !form.dealId}
            >
              Save Changes
            </Button>
          </div>
        </>
      }
    >
      <FormSection>
        <FormField label="Type" htmlFor="activity-type">
          <FormSelect
            id="activity-type"
            value={form.type}
            onValueChange={(value) => update("type", value as DealActivityType)}
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
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <FormSelect
                id="activity-deal"
                value={form.dealId}
                onValueChange={handleDealChange}
                disabled={visibleDeals.length === 0}
                placeholder="Select deal"
                options={visibleDeals.map((entry) => {
                  const dealCustomer = getCustomerById(entry.customerId);
                  return {
                    value: entry.id,
                    label: `${dealCustomer?.name ?? "Unknown"} · ${entry.id}`,
                  };
                })}
              />
            </div>
            {form.dealId ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => viewDeal(form.dealId)}
                aria-label="View linked deal"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </FormField>

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

        <FormField label="Outcome" htmlFor="activity-outcome" optional>
          <Textarea
            id="activity-outcome"
            rows={2}
            placeholder="Next steps or result"
            value={form.outcome}
            onChange={(e) => update("outcome", e.target.value)}
          />
        </FormField>

        {activity ? (
          <FormField label="Recorded by" htmlFor="activity-recorded-by">
            <p
              id="activity-recorded-by"
              className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              {getUserName(users, activity.loggedByUserId)}
            </p>
          </FormField>
        ) : null}
      </FormSection>
    </RecordFormPage>
  );
}
