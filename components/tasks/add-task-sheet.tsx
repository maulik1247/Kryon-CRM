"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FormField } from "@/components/shared/form-field";
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

interface AddTaskSheetProps {
  defaultDealId?: string;
}

export function AddTaskSheet({ defaultDealId }: AddTaskSheetProps) {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">Add task</SheetTitle>
          <SheetDescription>
            {canAssign
              ? "Create a task and assign it to a team member."
              : "Create a task for yourself on a deal."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <Tabs defaultValue="task" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2">
                <TabsTrigger value="task">Task</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="task" className="mt-4 space-y-4">
                <FormField label="Added by" htmlFor="add-task-by">
                  <p
                    id="add-task-by"
                    className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    {currentUser.name}
                  </p>
                </FormField>

                <FormField label="Deal" htmlFor="add-task-deal">
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
                </FormField>

                <FormField label="What to do" htmlFor="add-task-title">
                  <Input
                    id="add-task-title"
                    placeholder="e.g. Send revised quote"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </FormField>
              </TabsContent>

              <TabsContent value="schedule" className="mt-4 space-y-4">
                <FormField label="Do by" htmlFor="add-task-due">
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder="Due date"
                  />
                </FormField>

                <UserAssigneeSelect
                  id="add-task-assignee"
                  label="Assigned to"
                  value={assignedToUserId}
                  onValueChange={setAssignedToUserId}
                  adminOnly
                />
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!title.trim() || !dealId}
            >
              Add task
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
