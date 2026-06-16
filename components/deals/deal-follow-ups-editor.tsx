"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { UserAssigneeSelect } from "@/components/shared/user-assignee-select";
import { defaultNextActionDate } from "@/lib/deal-form-defaults";

export interface DealFollowUpItem {
  clientId: string;
  taskId?: string;
  title: string;
  dueDate: string;
  assignedToUserId: string;
}

export function createFollowUpItem(
  assignedToUserId: string,
  overrides?: Partial<DealFollowUpItem>
): DealFollowUpItem {
  return {
    clientId: `followup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    dueDate: defaultNextActionDate(),
    assignedToUserId,
    ...overrides,
  };
}

interface DealFollowUpsEditorProps {
  items: DealFollowUpItem[];
  onChange: (items: DealFollowUpItem[]) => void;
  defaultAssigneeUserId: string;
}

export function DealFollowUpsEditor({
  items,
  onChange,
  defaultAssigneeUserId,
}: DealFollowUpsEditorProps) {
  const updateItem = (
    clientId: string,
    updates: Partial<DealFollowUpItem>
  ) => {
    onChange(
      items.map((item) =>
        item.clientId === clientId ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (clientId: string) => {
    onChange(items.filter((item) => item.clientId !== clientId));
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No follow-ups yet. Add the next steps for this deal.
        </p>
      ) : (
        items.map((item, index) => (
          <div
            key={item.clientId}
            className="space-y-3 rounded-md border border-border/60 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Follow-up {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.clientId)}
                aria-label={`Remove follow-up ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={item.title}
              onChange={(e) =>
                updateItem(item.clientId, { title: e.target.value })
              }
              placeholder="e.g. Send revised quote to procurement"
            />
            <DatePicker
              value={item.dueDate}
              onChange={(value) => updateItem(item.clientId, { dueDate: value })}
              placeholder="Due date"
            />
            <UserAssigneeSelect
              id={`followup-assignee-${item.clientId}`}
              value={item.assignedToUserId}
              onValueChange={(value) =>
                updateItem(item.clientId, { assignedToUserId: value })
              }
            />
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() =>
          onChange([
            ...items,
            createFollowUpItem(
              items.at(-1)?.assignedToUserId ?? defaultAssigneeUserId
            ),
          ])
        }
      >
        <Plus className="h-4 w-4" />
        Add follow-up
      </Button>
    </div>
  );
}
