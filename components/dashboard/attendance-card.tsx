"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  getAttendanceStatus,
  getTodayAttendance,
} from "@/lib/attendance-helpers";
import { formatTime } from "@/lib/utils";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";

export function AttendanceCard() {
  const { currentUser } = useAuth();
  const { attendanceRecords, checkIn, checkOut } = useCrmData();

  const todayRecord = getTodayAttendance(attendanceRecords, currentUser.id);
  const status = getAttendanceStatus(todayRecord);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle>
          <InfoLabel info={HELP.attendance}>Today&apos;s Attendance</InfoLabel>
        </CardTitle>
        <Badge
          variant={
            status === "checked_in"
              ? "default"
              : status === "checked_out"
                ? "secondary"
                : "outline"
          }
          className="ml-auto"
        >
          {status === "checked_in"
            ? "Checked in"
            : status === "checked_out"
              ? "Checked out"
              : "Not checked in"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Check in</p>
            <p className="font-medium">
              {todayRecord?.checkInAt
                ? formatTime(todayRecord.checkInAt)
                : "—"}
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">Check out</p>
            <p className="font-medium">
              {todayRecord?.checkOutAt
                ? formatTime(todayRecord.checkOutAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={status !== "absent"}
            onClick={() => checkIn(currentUser.id)}
          >
            <LogIn className="h-4 w-4" />
            Check in
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={status !== "checked_in"}
            onClick={() => checkOut(currentUser.id)}
          >
            <LogOut className="h-4 w-4" />
            Check out
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/attendance">View history</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
