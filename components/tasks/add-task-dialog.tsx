"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { canAssignDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { filterDealsForUser } from "@/lib/user-helpers";

interface AddTaskDialogProps {
  defaultDealId?: string;
}

export function AddTaskDialog({ defaultDealId }: AddTaskDialogProps) {
  const { currentUser, users } = useAuth();
  const canAssign = canAssignDeals(currentUser.role);
  const { deals, addDealTask, getCustomerById } = useCrmData();

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const [open, setOpen] = React.useState(false);
  const [dealId, setDealId] = React.useState(
    defaultDealId ?? visibleDeals[0]?.id ?? ""
  );
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState(today);
  const [assignedToUserId, setAssignedToUserId] = React.useState(
    currentUser.id
  );

  React.useEffect(() => {
    if (defaultDealId) setDealId(defaultDealId);
  }, [defaultDealId]);

  React.useEffect(() => {
    if (!dealId && visibleDeals[0]) setDealId(visibleDeals[0].id);
  }, [dealId, visibleDeals]);

  React.useEffect(() => {
    if (
      dealId &&
      !visibleDeals.some((deal) => deal.id === dealId) &&
      visibleDeals[0]
    ) {
      setDealId(visibleDeals[0].id);
    }
  }, [dealId, visibleDeals]);

  React.useEffect(() => {
    if (!canAssign) {
      setAssignedToUserId(currentUser.id);
    }
  }, [currentUser.id, canAssign]);

  const handleAdd = () => {
    if (!title.trim() || !dealId) return;

    addDealTask({
      dealId,
      title: title.trim(),
      dueDate,
      createdByUserId: currentUser.id,
      assignedToUserId: canAssign ? assignedToUserId : currentUser.id,
      assignerName: currentUser.name,
    });

    setTitle("");
    setDueDate(today);
    setAssignedToUserId(currentUser.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            {canAssign
              ? "Create a task and assign it to a team member."
              : "Create a task for yourself on a deal."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Added by</Label>
            <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {currentUser.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-task-deal">Deal</Label>
            <Select value={dealId} onValueChange={setDealId}>
              <SelectTrigger id="add-task-deal">
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                {visibleDeals.map((deal) => {
                  const customer = getCustomerById(deal.customerId);
                  return (
                    <SelectItem key={deal.id} value={deal.id}>
                      {customer?.name ?? "Unknown"} · {deal.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-task-title">What to do</Label>
            <Input
              id="add-task-title"
              placeholder="e.g. Send revised quote"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Do by</Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="Due date"
            />
          </div>

          <UserAssigneeSelect
            id="add-task-assignee"
            label="Assigned to"
            value={assignedToUserId}
            onValueChange={setAssignedToUserId}
            adminOnly
          />

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!title.trim() || !dealId}
          >
            Add task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
