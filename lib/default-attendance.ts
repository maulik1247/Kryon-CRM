import type { AttendanceRecord } from "./types";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function atTime(date: string, hours: number, minutes: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours, minutes, 0, 0);
  return value.toISOString();
}

export function createDefaultAttendance(): AttendanceRecord[] {
  const today = daysAgo(0);
  const yesterday = daysAgo(1);
  const twoDaysAgo = daysAgo(2);

  return [
    {
      id: "att-1",
      userId: "user-2",
      date: today,
      checkInAt: atTime(today, 9, 12),
    },
    {
      id: "att-2",
      userId: "user-3",
      date: today,
      checkInAt: atTime(today, 8, 55),
      checkOutAt: atTime(today, 18, 5),
    },
    {
      id: "att-3",
      userId: "user-4",
      date: today,
      checkInAt: atTime(today, 9, 30),
    },
    {
      id: "att-4",
      userId: "user-2",
      date: yesterday,
      checkInAt: atTime(yesterday, 9, 5),
      checkOutAt: atTime(yesterday, 18, 15),
    },
    {
      id: "att-5",
      userId: "user-3",
      date: yesterday,
      checkInAt: atTime(yesterday, 9, 0),
      checkOutAt: atTime(yesterday, 17, 45),
    },
    {
      id: "att-6",
      userId: "user-admin",
      date: yesterday,
      checkInAt: atTime(yesterday, 8, 45),
      checkOutAt: atTime(yesterday, 19, 0),
    },
    {
      id: "att-7",
      userId: "user-4",
      date: twoDaysAgo,
      checkInAt: atTime(twoDaysAgo, 9, 20),
      checkOutAt: atTime(twoDaysAgo, 18, 0),
    },
  ];
}
