import { AppShell } from "@/components/layout/app-shell";
import { AttendanceView } from "@/components/attendance/attendance-view";

export default function AttendancePage() {
  return (
    <AppShell title="Attendance">
      <AttendanceView />
    </AppShell>
  );
}
