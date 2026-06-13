"use client";

import { Badge } from "@/components/ui/badge";
import { DetailGrid } from "@/components/shared/detail-grid";
import {
  ExpandableMobileCard,
  useExpandableCards,
} from "@/components/shared/expandable-mobile-card";
import type { AttendanceRecord } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

type AttendanceStatus = "absent" | "checked_in" | "checked_out";

function statusLabel(status: AttendanceStatus) {
  if (status === "checked_in") return "Checked in";
  if (status === "checked_out") return "Checked out";
  return "Absent";
}

function statusVariant(status: AttendanceStatus) {
  if (status === "checked_in") return "default" as const;
  if (status === "checked_out") return "secondary" as const;
  return "outline" as const;
}

interface AttendanceMobileListProps {
  records: AttendanceRecord[];
  showUser?: boolean;
  userName: (userId: string) => string;
  getStatus: (record: AttendanceRecord) => AttendanceStatus;
}

export function AttendanceMobileList({
  records,
  showUser,
  userName,
  getStatus,
}: AttendanceMobileListProps) {
  const { expandedId, toggleExpanded } = useExpandableCards();

  return (
    <div className="space-y-3 md:hidden">
      {records.map((record) => {
        const status = getStatus(record);

        return (
          <ExpandableMobileCard
            key={record.id}
            id={record.id}
            expandedId={expandedId}
            onToggle={toggleExpanded}
            summary={
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{formatDate(record.date)}</p>
                  {showUser ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {userName(record.userId)}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    In {record.checkInAt ? formatTime(record.checkInAt) : "—"}
                    {" · "}
                    Out {record.checkOutAt ? formatTime(record.checkOutAt) : "—"}
                  </p>
                </div>
                <Badge variant={statusVariant(status)}>
                  {statusLabel(status)}
                </Badge>
              </div>
            }
            details={
              <DetailGrid
                items={[
                  ...(showUser
                    ? [{ label: "User", value: userName(record.userId) }]
                    : []),
                  {
                    label: "Check in",
                    value: record.checkInAt
                      ? formatTime(record.checkInAt)
                      : undefined,
                  },
                  {
                    label: "Check out",
                    value: record.checkOutAt
                      ? formatTime(record.checkOutAt)
                      : undefined,
                  },
                  { label: "Status", value: statusLabel(status) },
                ]}
              />
            }
          />
        );
      })}
    </div>
  );
}
