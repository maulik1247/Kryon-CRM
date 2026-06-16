"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { InfoLabel } from "@/components/shared/info-tip";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getOpenDealsByConfidence } from "@/lib/deal-helpers";
import { HELP } from "@/lib/help-content";
import { filterDealsForUser } from "@/lib/user-helpers";
import {
  CHART_AXIS_COLOR,
  CHART_BAR_RADIUS,
  CHART_BAR_RADIUS_HORIZONTAL,
  CHART_DESKTOP_HEIGHT,
  CHART_DESKTOP_MARGIN,
  CHART_GRID_CLASS,
  CHART_MOBILE_BAR_HEIGHT,
  CHART_MOBILE_MARGIN,
  CHART_PRIMARY,
  chartPercentOfTotal,
  formatChartCount,
} from "@/lib/chart-theme";

const chartConfig = {
  count: {
    label: "Deals",
    color: CHART_PRIMARY,
  },
} satisfies ChartConfig;

type ConfidenceChartDatum = {
  label: string;
  count: number;
  color: string;
};

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`w-full animate-pulse rounded-lg bg-muted/40 ${className ?? ""}`}
    />
  );
}

function ConfidenceChartDesktop({
  data,
  chartKey,
  totalDeals,
}: {
  data: ConfidenceChartDatum[];
  chartKey: string;
  totalDeals: number;
}) {
  return (
    <ChartContainer
      key={chartKey}
      config={chartConfig}
      className="h-full w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={CHART_DESKTOP_MARGIN}
      >
        <CartesianGrid vertical={false} className={CHART_GRID_CLASS} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
          domain={[0, "dataMax + 1"]}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 10 }}
          tickFormatter={formatChartCount}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              labelKey="label"
              nameKey="count"
              formatter={(value) => [
                `${value} deals (${chartPercentOfTotal(Number(value), totalDeals)} of total)`,
                "Deals",
              ]}
            />
          }
        />
        <Bar
          dataKey="count"
          radius={CHART_BAR_RADIUS}
          maxBarSize={52}
          isAnimationActive
          animationDuration={400}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function ConfidenceChartMobile({
  data,
  chartKey,
  totalDeals,
}: {
  data: ConfidenceChartDatum[];
  chartKey: string;
  totalDeals: number;
}) {
  const chartHeight = Math.max(180, data.length * CHART_MOBILE_BAR_HEIGHT + 16);

  return (
    <ChartContainer
      key={`mobile-${chartKey}`}
      config={chartConfig}
      className="h-full w-full"
      style={{ minHeight: chartHeight }}
    >
      <BarChart
        accessibilityLayer
        layout="vertical"
        data={data}
        margin={CHART_MOBILE_MARGIN}
        barCategoryGap="20%"
      >
        <CartesianGrid horizontal={false} className={CHART_GRID_CLASS} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={[0, "dataMax + 1"]}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 10 }}
          tickFormatter={formatChartCount}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              labelKey="label"
              nameKey="count"
              formatter={(value) => [
                `${value} deals (${chartPercentOfTotal(Number(value), totalDeals)} of total)`,
                "Deals",
              ]}
            />
          }
        />
        <Bar
          dataKey="count"
          radius={CHART_BAR_RADIUS_HORIZONTAL}
          maxBarSize={22}
          isAnimationActive
          animationDuration={400}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function DealConfidenceChart() {
  const pathname = usePathname();
  const { currentUser, users } = useAuth();
  const { deals, pipelineStages } = useCrmData();
  const [ready, setReady] = React.useState(false);

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const data = getOpenDealsByConfidence(visibleDeals, pipelineStages).map(
    (item) => ({
      label: item.label,
      count: item.count,
      color: item.color,
    })
  );

  const totalDeals = data.reduce((sum, item) => sum + item.count, 0);
  const chartKey = `${pathname}-${currentUser.id}-${data.map((d) => d.count).join("-")}`;
  const mobileChartHeight = Math.max(180, data.length * CHART_MOBILE_BAR_HEIGHT + 16);

  React.useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname, data.length]);

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>
          <InfoLabel info={HELP.myConfidenceChart}>
            My Deals by Confidence
          </InfoLabel>
        </CardTitle>
        <CardDescription>
          Open deals grouped by win probability
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex-1 pt-0">
        <div
          className="w-full md:hidden"
          style={{ height: mobileChartHeight }}
        >
          {ready ? (
            data.length > 0 ? (
              <ConfidenceChartMobile
                data={data}
                chartKey={chartKey}
                totalDeals={totalDeals}
              />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No open deals to show yet.
              </p>
            )
          ) : (
            <ChartSkeleton className="h-full" />
          )}
        </div>

        <div
          className="hidden w-full md:block"
          style={{ height: CHART_DESKTOP_HEIGHT }}
        >
          {ready ? (
            data.length > 0 ? (
              <ConfidenceChartDesktop
                data={data}
                chartKey={chartKey}
                totalDeals={totalDeals}
              />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No open deals to show yet.
              </p>
            )
          ) : (
            <ChartSkeleton className="h-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
