"use client";

import * as React from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { DocumentFilesEditor } from "@/components/shared/document-files-editor";
import { UserMultiSelect } from "@/components/shared/user-multi-select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { CONFIDENCE_FORM_OPTIONS } from "@/lib/confidence-constants";
import {
  CUSTOMER_SENTIMENTS,
  getDefaultDateTimeLocal,
  MEETING_PURPOSES,
  VISIT_TYPES,
} from "@/lib/meeting-log-constants";
import { canAssignDeals } from "@/lib/role-permissions";
import {
  filterCustomersForUser,
  filterDealsForUser,
  getActiveUsers,
} from "@/lib/user-helpers";
import type {
  ConfidenceLevel,
  DealActivity,
  DealActivityType,
  MeetingActionItem,
  MeetingCustomerAttendee,
  RegistrationDocument,
} from "@/lib/types";

interface MeetingLogFormProps {
  activity?: DealActivity;
  defaultDealId?: string;
  defaultCustomerId?: string;
  onSaved?: () => void;
  onViewDeal?: (dealId: string) => void;
  formId?: string;
  hideActions?: boolean;
  submitLabel?: string;
}

function emptyActionItem(ownerUserId: string): MeetingActionItem {
  return {
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    ownerUserId,
    deadline: new Date().toISOString().split("T")[0],
  };
}

function contactToAttendee(contact: {
  id: string;
  name: string;
  designation: string;
  department: string;
}): MeetingCustomerAttendee {
  return {
    contactId: contact.id,
    name: contact.name,
    designation: contact.designation,
    department: contact.department,
  };
}

export function MeetingLogForm({
  activity,
  defaultDealId,
  defaultCustomerId,
  onSaved,
  onViewDeal,
  formId = "meeting-log-form",
  hideActions = false,
  submitLabel = "Save meeting log",
}: MeetingLogFormProps) {
  const { currentUser, users } = useAuth();
  const {
    customers,
    deals,
    suppliers,
    addDealActivity,
    updateDealActivity,
    updateDeal,
    addDealTask,
    getDealById,
    getCustomerById,
    getContactsByCustomerId,
  } = useCrmData();

  const isEdit = Boolean(activity);
  const activeUsers = getActiveUsers(users);

  const canAssign = canAssignDeals(currentUser.role);

  const visibleCustomers = React.useMemo(
    () => filterCustomersForUser(customers, currentUser, users),
    [customers, currentUser, users]
  );
  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const initialDeal = activity
    ? getDealById(activity.dealId)
    : defaultDealId
      ? getDealById(defaultDealId)
      : undefined;

  const [activeTab, setActiveTab] = React.useState("details");
  const [loggedByUserId, setLoggedByUserId] = React.useState(
    activity?.loggedByUserId ?? currentUser.id
  );
  const [occurredAt, setOccurredAt] = React.useState(() => {
    if (!activity?.occurredAt) return getDefaultDateTimeLocal();
    if (activity.occurredAt.includes("T")) {
      return activity.occurredAt.slice(0, 16);
    }
    return `${activity.occurredAt}T10:00`;
  });
  const [activityType, setActivityType] = React.useState<DealActivityType>(
    activity?.type ?? "visit"
  );
  const [visitType, setVisitType] = React.useState(
    activity?.visitType ?? "In-Person"
  );
  const [purpose, setPurpose] = React.useState(
    activity?.purpose ?? "Discovery"
  );
  const [customerId, setCustomerId] = React.useState(
    activity?.customerId ??
      initialDeal?.customerId ??
      defaultCustomerId ??
      visibleCustomers[0]?.id ??
      ""
  );
  const [dealId, setDealId] = React.useState(
    activity?.dealId ?? defaultDealId ?? visibleDeals[0]?.id ?? ""
  );
  const [ourAttendeeIds, setOurAttendeeIds] = React.useState<string[]>(
    activity?.ourAttendeeIds ?? [currentUser.id]
  );
  const [customerAttendees, setCustomerAttendees] = React.useState<
    MeetingCustomerAttendee[]
  >(activity?.customerAttendees ?? []);
  const [summary, setSummary] = React.useState(activity?.summary ?? "");
  const [keyDecisions, setKeyDecisions] = React.useState(
    activity?.keyDecisions ?? activity?.outcome ?? ""
  );
  const [actionItems, setActionItems] = React.useState<MeetingActionItem[]>(
    activity?.actionItems ?? []
  );
  const [confidenceUpdated, setConfidenceUpdated] = React.useState(
    activity?.confidenceUpdated !== undefined
      ? String(activity.confidenceUpdated)
      : "__none__"
  );
  const [customerSentiment, setCustomerSentiment] = React.useState(
    activity?.customerSentiment ?? "__none__"
  );
  const [competitorSupplierId, setCompetitorSupplierId] = React.useState(
    activity?.competitorSupplierId ?? "__none__"
  );
  const [attachments, setAttachments] = React.useState<RegistrationDocument[]>(
    activity?.attachments ?? []
  );
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState(
    activity?.nextFollowUpDate ?? ""
  );
  const [contactPicker, setContactPicker] = React.useState("");

  const customerDeals = React.useMemo(
    () => visibleDeals.filter((deal) => deal.customerId === customerId),
    [visibleDeals, customerId]
  );
  const contacts = React.useMemo(
    () => (customerId ? getContactsByCustomerId(customerId) : []),
    [customerId, getContactsByCustomerId]
  );
  const availableContacts = contacts.filter(
    (contact) =>
      !customerAttendees.some((attendee) => attendee.contactId === contact.id)
  );

  React.useEffect(() => {
    if (!customerId && visibleCustomers[0]) {
      setCustomerId(visibleCustomers[0].id);
    }
  }, [customerId, visibleCustomers]);

  React.useEffect(() => {
    const validDeal = customerDeals.some((deal) => deal.id === dealId);
    if (!validDeal) {
      setDealId(customerDeals[0]?.id ?? "");
    }
  }, [customerDeals, dealId]);

  const handleCustomerChange = (nextCustomerId: string) => {
    setCustomerId(nextCustomerId);
    setCustomerAttendees([]);
    const nextDeals = visibleDeals.filter(
      (deal) => deal.customerId === nextCustomerId
    );
    setDealId(nextDeals[0]?.id ?? "");
  };

  const addCustomerAttendee = (contactId: string) => {
    const contact = contacts.find((entry) => entry.id === contactId);
    if (!contact) return;
    setCustomerAttendees((prev) => [...prev, contactToAttendee(contact)]);
    setContactPicker("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !dealId || !customerId) return;

    const payload: Omit<DealActivity, "id" | "createdAt"> = {
      dealId,
      customerId,
      type: activityType,
      occurredAt,
      visitType,
      purpose,
      ourAttendeeIds,
      customerAttendees,
      summary: summary.trim(),
      keyDecisions: keyDecisions.trim() || undefined,
      actionItems: actionItems.filter((item) => item.description.trim()),
      confidenceUpdated:
        confidenceUpdated && confidenceUpdated !== "__none__"
          ? (Number(confidenceUpdated) as ConfidenceLevel)
          : undefined,
      customerSentiment:
        customerSentiment && customerSentiment !== "__none__"
          ? (customerSentiment as DealActivity["customerSentiment"])
          : undefined,
      competitorSupplierId:
        competitorSupplierId && competitorSupplierId !== "__none__"
          ? competitorSupplierId
          : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      loggedByUserId: canAssign ? loggedByUserId : currentUser.id,
      assignedToUserId: ourAttendeeIds.find((id) => id !== currentUser.id),
    };

    if (isEdit && activity) {
      updateDealActivity(activity.id, {
        ...payload,
        recorderName: currentUser.name,
      });
    } else {
      addDealActivity({
        ...payload,
        recorderName: currentUser.name,
      });

      payload.actionItems?.forEach((item) => {
        addDealTask({
          dealId,
          title: item.description.trim(),
          dueDate: item.deadline,
          createdByUserId: currentUser.id,
          assignedToUserId: item.ownerUserId,
          assignerName: currentUser.name,
        });
      });
    }

    if (payload.confidenceUpdated !== undefined) {
      updateDeal(dealId, { confidence: payload.confidenceUpdated });
    }

    onSaved?.();
  };

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendees">
            Attendees
            {ourAttendeeIds.length + customerAttendees.length > 0 ? (
              <span className="ml-1 text-xs text-muted-foreground">
                ({ourAttendeeIds.length + customerAttendees.length})
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="actions">
            Actions
            {actionItems.length > 0 ? (
              <span className="ml-1 text-xs text-muted-foreground">
                ({actionItems.length})
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="attachments">
            Files
            {attachments.length > 0 ? (
              <span className="ml-1 text-xs text-muted-foreground">
                ({attachments.length})
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className="mt-4 space-y-4 data-[state=inactive]:hidden"
        >
          <FormField label="Logged by" htmlFor="meeting-user">
            {canAssign ? (
              <FormSelect
                id="meeting-user"
                value={loggedByUserId}
                onValueChange={setLoggedByUserId}
                options={activeUsers.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
              />
            ) : (
              <Input
                id="meeting-user"
                readOnly
                value={currentUser.name}
                className="bg-muted/30"
              />
            )}
          </FormField>

          <FormField label="Visit date & time" htmlFor="meeting-datetime">
            <Input
              id="meeting-datetime"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Record type" htmlFor="meeting-record-type">
            <FormSelect
              id="meeting-record-type"
              value={activityType}
              onValueChange={(value) => setActivityType(value as DealActivityType)}
              options={[
                { value: "visit", label: "Visit" },
                { value: "meeting", label: "Meeting" },
              ]}
            />
          </FormField>

          <FormField label="Visit type" htmlFor="meeting-visit-type">
            <FormSelect
              id="meeting-visit-type"
              value={visitType}
              onValueChange={(value) => setVisitType(value as typeof visitType)}
              options={VISIT_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </FormField>

          <FormField label="Purpose" htmlFor="meeting-purpose">
            <FormSelect
              id="meeting-purpose"
              value={purpose}
              onValueChange={(value) => setPurpose(value as typeof purpose)}
              options={MEETING_PURPOSES.map((entry) => ({
                value: entry,
                label: entry,
              }))}
            />
          </FormField>

          <FormField label="Customer" htmlFor="meeting-customer">
            <FormSelect
              id="meeting-customer"
              value={customerId}
              onValueChange={handleCustomerChange}
              disabled={visibleCustomers.length === 0}
              placeholder="Select customer"
              options={visibleCustomers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
            />
          </FormField>

          <FormField label="Deal" htmlFor="meeting-deal">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <FormSelect
                  id="meeting-deal"
                  value={dealId}
                  onValueChange={setDealId}
                  disabled={customerDeals.length === 0}
                  placeholder="Select deal"
                  options={customerDeals.map((deal) => ({
                    value: deal.id,
                    label: deal.id,
                  }))}
                />
              </div>
              {onViewDeal && dealId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onViewDeal(dealId)}
                  aria-label="View linked deal"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </FormField>

          <FormField label="Discussion summary" htmlFor="meeting-summary">
            <Textarea
              id="meeting-summary"
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What was discussed?"
            />
          </FormField>

          <FormField label="Key decisions" htmlFor="meeting-decisions" optional>
            <Textarea
              id="meeting-decisions"
              rows={2}
              value={keyDecisions}
              onChange={(e) => setKeyDecisions(e.target.value)}
            />
          </FormField>

          <FormField label="Confidence updated" htmlFor="meeting-confidence" optional>
            <FormSelect
              id="meeting-confidence"
              value={confidenceUpdated}
              onValueChange={setConfidenceUpdated}
              options={[
                { value: "__none__", label: "No change" },
                ...CONFIDENCE_FORM_OPTIONS,
              ]}
            />
          </FormField>

          <FormField label="Customer sentiment" htmlFor="meeting-sentiment">
            <FormSelect
              id="meeting-sentiment"
              value={customerSentiment}
              onValueChange={setCustomerSentiment}
              options={[
                { value: "__none__", label: "Not recorded" },
                ...CUSTOMER_SENTIMENTS.map((sentiment) => ({
                  value: sentiment,
                  label: sentiment,
                })),
              ]}
            />
          </FormField>

          <FormField label="Competitor discussed" htmlFor="meeting-competitor">
            <FormSelect
              id="meeting-competitor"
              value={competitorSupplierId}
              onValueChange={setCompetitorSupplierId}
              options={[
                { value: "__none__", label: "None" },
                ...suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                })),
              ]}
            />
          </FormField>

          <FormField label="Next follow-up" htmlFor="meeting-follow-up" optional>
            <DatePicker
              value={nextFollowUpDate}
              onChange={setNextFollowUpDate}
              placeholder="Select date"
            />
          </FormField>
        </TabsContent>

        <TabsContent
          value="attendees"
          className="mt-4 space-y-4 data-[state=inactive]:hidden"
        >
          <UserMultiSelect
            id="meeting-our-attendees"
            label="Our attendees"
            value={ourAttendeeIds}
            onChange={setOurAttendeeIds}
          />

          <FormField label="Customer attendees" htmlFor="meeting-customer-attendee">
            <FormSelect
              id="meeting-customer-attendee"
              value={contactPicker}
              onValueChange={(value) => {
                addCustomerAttendee(value);
                setContactPicker("");
              }}
              disabled={availableContacts.length === 0}
              placeholder="Add from contacts"
              options={availableContacts.map((contact) => ({
                value: contact.id,
                label: `${contact.name} · ${contact.department}`,
              }))}
            />
          </FormField>

          {customerAttendees.length > 0 ? (
            <div className="space-y-2">
              {customerAttendees.map((attendee) => (
                <div
                  key={attendee.contactId}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {attendee.name} · {attendee.designation}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCustomerAttendees((prev) =>
                        prev.filter(
                          (entry) => entry.contactId !== attendee.contactId
                        )
                      )
                    }
                    aria-label={`Remove ${attendee.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No customer attendees added yet.
            </p>
          )}
        </TabsContent>

        <TabsContent
          value="actions"
          className="mt-4 space-y-4 data-[state=inactive]:hidden"
        >
          {actionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No action items yet.
            </p>
          ) : (
            actionItems.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Item {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setActionItems((prev) =>
                        prev.filter((entry) => entry.id !== item.id)
                      )
                    }
                    aria-label={`Remove action ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    setActionItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, description: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="Task description"
                />
                <FormSelect
                  value={item.ownerUserId}
                  onValueChange={(value) =>
                    setActionItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, ownerUserId: value }
                          : entry
                      )
                    )
                  }
                  options={activeUsers.map((user) => ({
                    value: user.id,
                    label: user.name,
                  }))}
                />
                <DatePicker
                  value={item.deadline}
                  onChange={(value) =>
                    setActionItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, deadline: value }
                          : entry
                      )
                    )
                  }
                  placeholder="Deadline"
                />
              </div>
            ))
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setActionItems((prev) => [
                ...prev,
                emptyActionItem(currentUser.id),
              ])
            }
          >
            <Plus className="h-4 w-4" />
            Add action item
          </Button>
        </TabsContent>

        <TabsContent
          value="attachments"
          className="mt-4 space-y-4 data-[state=inactive]:hidden"
        >
          <DocumentFilesEditor
            inputId="meeting-attachments"
            label="Attachments"
            value={attachments}
            onChange={setAttachments}
            helperText="PDF, DOC, JPG — optional"
            emptyMessage="No files attached."
          />
        </TabsContent>
      </Tabs>

      {!hideActions ? (
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={!summary.trim() || !dealId}>
            {submitLabel}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
