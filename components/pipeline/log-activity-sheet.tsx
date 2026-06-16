"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MeetingLogForm } from "@/components/activity/meeting-log-form";

interface LogActivitySheetProps {
  defaultDealId?: string;
}

export function LogActivitySheet({ defaultDealId }: LogActivitySheetProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
          <SheetTitle className="font-display">Activity log</SheetTitle>
          <SheetDescription>
            Record visits, meetings, calls, emails, and notes with follow-up
            details.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <MeetingLogForm
              defaultDealId={defaultDealId}
              formId="log-meeting-form"
              hideActions
              onSaved={() => setOpen(false)}
            />
          </div>

          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" form="log-meeting-form">
              Save log
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
