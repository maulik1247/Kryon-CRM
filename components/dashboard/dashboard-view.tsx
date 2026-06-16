"use client";

import { useAuth } from "@/lib/auth-provider";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { DealConfidenceChart } from "@/components/dashboard/deal-confidence-chart";
import { StuckDealsCard } from "@/components/dashboard/stuck-deals-card";
import { DueThisWeekCard } from "@/components/dashboard/due-this-week-card";
import { DashboardTasksCard } from "@/components/dashboard/dashboard-tasks-card";
import { MyActivitiesCard } from "@/components/dashboard/my-activities-card";

export function DashboardView() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <div className="min-w-0 space-y-6">
        <KpiCards />
        <PipelineChart />
        <DashboardTasksCard />
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <StuckDealsCard />
          </div>
          <div className="min-w-0">
            <DueThisWeekCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <KpiCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart />
        <DealConfidenceChart />
      </div>
      <DashboardTasksCard />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <DueThisWeekCard />
        </div>
        <div className="min-w-0">
          <MyActivitiesCard />
        </div>
      </div>
    </div>
  );
}
