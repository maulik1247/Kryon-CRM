"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAssigneeSelect } from "@/components/shared/user-assignee-select";
import { useCrmData } from "@/lib/crm-data-provider";
import { useAuth } from "@/lib/auth-provider";
import { ACTIVITY_TYPE_OPTIONS } from "@/lib/activity-constants";
import { isAssignableActivityType } from "@/lib/user-helpers";
import type { DealActivityType } from "@/lib/types";

interface LogActivityFormProps {
  dealId: string;
  customerId: string;
  onLogged?: () => void;
  submitLabel?: string;
}

export function LogActivityForm({
  dealId,
  customerId,
  onLogged,
  submitLabel = "Log activity",
}: LogActivityFormProps) {
  const { currentUser, isAdmin } = useAuth();
  const { addDealActivity, getContactsByCustomerId } = useCrmData();

  const contacts = getContactsByCustomerId(customerId);
  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = React.useState<DealActivityType>("call");
  const [occurredAt, setOccurredAt] = React.useState(today);
  const [contactId, setContactId] = React.useState(contacts[0]?.id ?? "");
  const [assignedToUserId, setAssignedToUserId] = React.useState(
    currentUser.id
  );
  const [summary, setSummary] = React.useState("");
  const [outcome, setOutcome] = React.useState("");

  React.useEffect(() => {
    setContactId(contacts[0]?.id ?? "");
  }, [customerId, contacts]);

  React.useEffect(() => {
    if (!isAdmin) {
      setAssignedToUserId(currentUser.id);
    }
  }, [currentUser.id, isAdmin]);

  const showAssignee = isAdmin && isAssignableActivityType(type);

  const handleLog = () => {
    if (!summary.trim()) return;

    const assigneeId = showAssignee ? assignedToUserId : currentUser.id;

    addDealActivity({
      dealId,
      type,
      occurredAt,
      contactId: contactId || undefined,
      summary: summary.trim(),
      outcome: outcome.trim() || undefined,
      loggedByUserId: currentUser.id,
      assignedToUserId:
        assigneeId !== currentUser.id ? assigneeId : undefined,
      recorderName: currentUser.name,
    });

    setSummary("");
    setOutcome("");
    setOccurredAt(today);
    setAssignedToUserId(currentUser.id);
    onLogged?.();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Recorded by</Label>
        <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {currentUser.name}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`activity-type-${dealId}`}>Type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as DealActivityType)}
          >
            <SelectTrigger id={`activity-type-${dealId}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePicker
            value={occurredAt}
            onChange={setOccurredAt}
            placeholder="When it happened"
          />
        </div>
      </div>

      {showAssignee && (
        <UserAssigneeSelect
          id={`activity-assignee-${dealId}`}
          label="Assigned to"
          value={assignedToUserId}
          onValueChange={setAssignedToUserId}
        />
      )}

      {contacts.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor={`activity-contact-${dealId}`}>Contact</Label>
          <Select value={contactId} onValueChange={setContactId}>
            <SelectTrigger id={`activity-contact-${dealId}`}>
              <SelectValue placeholder="Who you spoke with" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`activity-summary-${dealId}`}>Summary</Label>
        <Textarea
          id={`activity-summary-${dealId}`}
          rows={2}
          placeholder="What was discussed?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`activity-outcome-${dealId}`}>
          Outcome <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`activity-outcome-${dealId}`}
          rows={2}
          placeholder="Next steps or result from the conversation"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
      </div>

      <Button
        type="button"
        size="sm"
        onClick={handleLog}
        disabled={!summary.trim()}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
