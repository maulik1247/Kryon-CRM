"use client";

import { useAuth } from "@/lib/auth-provider";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { DealConfidenceChart } from "@/components/dashboard/deal-confidence-chart";
import { StuckDealsCard } from "@/components/dashboard/stuck-deals-card";
import { DueThisWeekCard } from "@/components/dashboard/due-this-week-card";
import { DashboardTasksCard } from "@/components/dashboard/dashboard-tasks-card";
import { AttendanceCard } from "@/components/dashboard/attendance-card";
import { AttendanceTeamCard } from "@/components/dashboard/attendance-team-card";
import { MyActivitiesCard } from "@/components/dashboard/my-activities-card";

export function DashboardView() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <KpiCards />
        <PipelineChart />
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardTasksCard />
          <AttendanceTeamCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <StuckDealsCard />
          <DueThisWeekCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KpiCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart />
        <DealConfidenceChart />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardTasksCard />
        <AttendanceCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DueThisWeekCard />
        <MyActivitiesCard />
      </div>
    </div>
  );
}
