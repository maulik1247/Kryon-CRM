"use client";

import dynamic from "next/dynamic";
import { ChartCardSkeleton } from "@/components/shared/chart-card-skeleton";
import { useAuth } from "@/lib/auth-provider";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { StuckDealsCard } from "@/components/dashboard/stuck-deals-card";
import { DueThisWeekCard } from "@/components/dashboard/due-this-week-card";
import { DashboardTasksCard } from "@/components/dashboard/dashboard-tasks-card";
import { MyActivitiesCard } from "@/components/dashboard/my-activities-card";

const PipelineChart = dynamic(
  () =>
    import("@/components/dashboard/pipeline-chart").then(
      (mod) => mod.PipelineChart
    ),
  {
    loading: () => <ChartCardSkeleton />,
    ssr: false,
  }
);

const DealConfidenceChart = dynamic(
  () =>
    import("@/components/dashboard/deal-confidence-chart").then(
      (mod) => mod.DealConfidenceChart
    ),
  {
    loading: () => <ChartCardSkeleton />,
    ssr: false,
  }
);

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
