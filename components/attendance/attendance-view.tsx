"use client";

import * as React from "react";
import { LogIn, LogOut, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileTableScroll } from "@/components/shared/mobile-table-scroll";
import { EmptyState } from "@/components/shared/empty-state";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { InfoTip } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  filterAttendanceForUser,
  getAttendanceStatus,
  getTodayAttendance,
} from "@/lib/attendance-helpers";
import { getUserName } from "@/lib/user-helpers";
import { formatDate, formatTime } from "@/lib/utils";

export function AttendanceView() {
  const { currentUser, isAdmin, users } = useAuth();
  const { attendanceRecords, checkIn, checkOut } = useCrmData();

  const records = React.useMemo(
    () =>
      filterAttendanceForUser(
        attendanceRecords,
        currentUser.id,
        isAdmin
      ),
    [attendanceRecords, currentUser.id, isAdmin]
  );

  const todayRecord = getTodayAttendance(attendanceRecords, currentUser.id);
  const todayStatus = getAttendanceStatus(todayRecord);

  return (
    <>
      <PageToolbar
        description={
          isAdmin
            ? "Mark your attendance and review team check-in history."
            : "Check in when you start and check out when you leave."
        }
        meta={
          <span>
            {todayRecord?.checkInAt
              ? `Checked in at ${formatTime(todayRecord.checkInAt)}`
              : "Not checked in today"}
            {todayRecord?.checkOutAt
              ? ` · Out ${formatTime(todayRecord.checkOutAt)}`
              : ""}
          </span>
        }
        actions={
          <>
            <InfoTip
              content={HELP.attendance}
              className="self-center"
              label="About attendance"
            />
            <Button
              type="button"
              className="gap-2"
              disabled={todayStatus !== "absent"}
              onClick={() => checkIn(currentUser.id)}
            >
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={todayStatus !== "checked_in"}
              onClick={() => checkOut(currentUser.id)}
            >
              <LogOut className="h-4 w-4" />
              Check out
            </Button>
          </>
        }
      />

      <Card className="shadow-sm">
          <MobileTableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {isAdmin ? <TableHead>User</TableHead> : null}
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="p-0">
                      <EmptyState
                        icon={Clock}
                        title="No attendance records"
                        description="Your check-in history will appear here after your first punch."
                        className="m-4 border-none bg-transparent shadow-none"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const status = getAttendanceStatus(record);

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(record.date)}
                        </TableCell>
                        {isAdmin ? (
                          <TableCell className="max-w-[160px] truncate">
                            {getUserName(users, record.userId)}
                          </TableCell>
                        ) : null}
                        <TableCell className="whitespace-nowrap">
                          {record.checkInAt
                            ? formatTime(record.checkInAt)
                            : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {record.checkOutAt
                            ? formatTime(record.checkOutAt)
                            : "—"}
                        </TableCell>
                        <TableCell>
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
                              ? "Checked in"
                              : status === "checked_out"
                                ? "Checked out"
                                : "Absent"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </MobileTableScroll>
        </Card>
    </>
  );
}
