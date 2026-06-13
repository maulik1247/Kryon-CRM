import type { AttendanceRecord, CrmUser } from "./types";

export function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export function getAttendanceForDate(
  records: AttendanceRecord[],
  userId: string,
  date: string
) {
  return records.find(
    (record) => record.userId === userId && record.date === date
  );
}

export function getTodayAttendance(
  records: AttendanceRecord[],
  userId: string
) {
  return getAttendanceForDate(records, userId, getTodayDateString());
}

export function getAttendanceStatus(record?: AttendanceRecord) {
  if (!record?.checkInAt) return "absent" as const;
  if (!record.checkOutAt) return "checked_in" as const;
  return "checked_out" as const;
}

export function getAttendanceRecordsSorted(records: AttendanceRecord[]) {
  return [...records].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      (b.checkInAt ? new Date(b.checkInAt).getTime() : 0) -
        (a.checkInAt ? new Date(a.checkInAt).getTime() : 0)
  );
}

export function filterAttendanceForUser(
  records: AttendanceRecord[],
  userId: string,
  isAdmin: boolean
) {
  if (isAdmin) return getAttendanceRecordsSorted(records);
  return getAttendanceRecordsSorted(
    records.filter((record) => record.userId === userId)
  );
}

export function getTodayTeamAttendance(
  records: AttendanceRecord[],
  users: CrmUser[]
) {
  const today = getTodayDateString();
  const activeUsers = users.filter((user) => user.active);

  return activeUsers.map((user) => {
    const record = getAttendanceForDate(records, user.id, today);
    return {
      user,
      record,
      status: getAttendanceStatus(record),
    };
  });
}
