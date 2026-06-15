"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MeetingLogForm } from "@/components/activity/meeting-log-form";

interface LogActivityDialogProps {
  defaultDealId?: string;
}

export function LogActivityDialog({ defaultDealId }: LogActivityDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Log Visit / Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:overflow-hidden sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle className="font-display">Visit / Meeting Log</DialogTitle>
          <DialogDescription>
            Record visit or meeting details, attendees, and follow-up actions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <MeetingLogForm
              defaultDealId={defaultDealId}
              formId="log-meeting-form"
              hideActions
              onSaved={() => setOpen(false)}
            />
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" form="log-meeting-form">
              Save log
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
