"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getTodayTeamAttendance } from "@/lib/attendance-helpers";
import { formatTime } from "@/lib/utils";
import { Users } from "lucide-react";

export function AttendanceTeamCard() {
  const { users } = useAuth();
  const { attendanceRecords } = useCrmData();

  const team = getTodayTeamAttendance(attendanceRecords, users);
  const checkedInCount = team.filter(
    (entry) => entry.status === "checked_in" || entry.status === "checked_out"
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Users className="h-4 w-4" />
        <CardTitle>Team Attendance Today</CardTitle>
        <Badge variant="secondary" className="ml-auto">
          {checkedInCount}/{team.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {team.map(({ user, record, status }) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {record?.checkInAt
                    ? `In ${formatTime(record.checkInAt)}`
                    : "Not checked in"}
                  {record?.checkOutAt
                    ? ` · Out ${formatTime(record.checkOutAt)}`
                    : ""}
                </p>
              </div>
              <Badge
                variant={
                  status === "checked_in"
                    ? "default"
                    : status === "checked_out"
                      ? "secondary"
                      : "outline"
                }
              >
                {status === "checked_in"
                  ? "In"
                  : status === "checked_out"
                    ? "Out"
                    : "Absent"}
              </Badge>
            </div>
          ))}
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/attendance">Manage attendance</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
