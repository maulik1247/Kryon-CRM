"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getDashboardKPIs } from "@/lib/deal-helpers";
import { isTaskOpen } from "@/lib/task-constants";
import { canViewAllDeals } from "@/lib/role-permissions";
import { filterDealsForUser, filterTasksForUser } from "@/lib/user-helpers";
import { formatCurrencyCr } from "@/lib/utils";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
import {
  Users,
  IndianRupee,
  AlertTriangle,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const KpiCards = React.memo(function KpiCards() {
  const { currentUser, users } = useAuth();
  const { deals, dealTasks, pipelineStages } = useCrmData();

  const seesAllDeals = canViewAllDeals(currentUser.role);

  const cards = React.useMemo(() => {
    const visibleDeals = filterDealsForUser(deals, currentUser, users);
    const kpis = getDashboardKPIs(visibleDeals, pipelineStages);
    const openTasks = filterTasksForUser(dealTasks, currentUser, users, deals)
      .filter((task) => isTaskOpen(task.status)).length;

    return seesAllDeals
      ? [
          {
            title: "Active Leads",
            info: HELP.activeLeads,
            value: kpis.activeLeads.toString(),
            icon: Users,
          },
          {
            title: "Pipeline Value",
            info: HELP.pipelineValue,
            value: formatCurrencyCr(kpis.pipelineValue),
            icon: IndianRupee,
          },
          {
            title: "Stuck Deals",
            info: HELP.stuckDeals,
            value: kpis.stuckDeals.toString(),
            icon: AlertTriangle,
          },
        ]
      : [
          {
            title: "My Active Deals",
            info: HELP.myActiveDeals,
            value: kpis.activeLeads.toString(),
            icon: Users,
          },
          {
            title: "My Pipeline Value",
            info: HELP.myPipelineValue,
            value: formatCurrencyCr(kpis.pipelineValue),
            icon: IndianRupee,
          },
          {
            title: "My Open Tasks",
            info: HELP.myOpenTasks,
            value: openTasks.toString(),
            icon: ListTodo,
          },
        ];
  }, [currentUser, users, deals, dealTasks, pipelineStages, seesAllDeals]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <InfoLabel info={card.info}>{card.title}</InfoLabel>
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl font-semibold tracking-tight">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
