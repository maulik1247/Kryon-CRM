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
import { useCrmData } from "@/lib/crm-data-provider";
import { getDealsPerStage } from "@/lib/deal-helpers";
import { splitStageLabel } from "@/lib/pipeline-label";
import { canViewAllDeals } from "@/lib/role-permissions";
import { useAuth } from "@/lib/auth-provider";
import { filterDealsForUser } from "@/lib/user-helpers";
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";
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
  formatChartCount,
} from "@/lib/chart-theme";

const chartConfig = {
  count: {
    label: "Deals",
    color: CHART_PRIMARY,
  },
} satisfies ChartConfig;

type StageChartDatum = {
  stage: string;
  count: number;
  color: string;
};

function StageAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const value = payload?.value ?? "";

  if (!value) {
    return <g />;
  }

  const lines = splitStageLabel(value);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={`${line}-${i}`}
          x={0}
          y={0}
          dy={12 + i * 12}
          textAnchor="middle"
          fontSize={10}
          fill={CHART_AXIS_COLOR}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function MobileStageYAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const value = payload?.value ?? "";
  const maxLength = 18;
  const label =
    value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

  return (
    <text
      x={x}
      y={y}
      dx={-4}
      dy={4}
      textAnchor="end"
      fontSize={10}
      fill={CHART_AXIS_COLOR}
    >
      {label}
    </text>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`w-full animate-pulse rounded-lg bg-muted/40 ${className ?? ""}`}
    />
  );
}

function PipelineChartDesktop({
  data,
  chartKey,
}: {
  data: StageChartDatum[];
  chartKey: string;
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
          dataKey="stage"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          interval={0}
          tick={StageAxisTick}
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
          content={<ChartTooltipContent labelKey="stage" nameKey="count" />}
        />
        <Bar
          dataKey="count"
          fill={CHART_PRIMARY}
          radius={CHART_BAR_RADIUS}
          maxBarSize={52}
          isAnimationActive
          animationDuration={400}
        >
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function PipelineChartMobile({
  data,
  chartKey,
}: {
  data: StageChartDatum[];
  chartKey: string;
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
          dataKey="stage"
          tickLine={false}
          axisLine={false}
          width={108}
          tick={MobileStageYAxisTick}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
          content={<ChartTooltipContent labelKey="stage" nameKey="count" />}
        />
        <Bar
          dataKey="count"
          fill={CHART_PRIMARY}
          radius={CHART_BAR_RADIUS_HORIZONTAL}
          maxBarSize={22}
          isAnimationActive
          animationDuration={400}
        >
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function PipelineChart() {
  const pathname = usePathname();
  const { currentUser, users } = useAuth();
  const { deals, pipelineStages } = useCrmData();
  const [ready, setReady] = React.useState(false);

  const visibleDeals = React.useMemo(
    () => filterDealsForUser(deals, currentUser, users),
    [deals, currentUser, users]
  );

  const data = getDealsPerStage(visibleDeals, pipelineStages).map((item) => ({
    stage: item.stage,
    count: item.count,
    color: item.color,
  }));

  const seesAllDeals = canViewAllDeals(currentUser.role);

  const chartKey = `${pathname}-${seesAllDeals ? "all" : currentUser.id}-${data.map((d) => d.count).join("-")}`;
  const mobileChartHeight = Math.max(180, data.length * CHART_MOBILE_BAR_HEIGHT + 16);
  const emptyMessage = seesAllDeals
    ? "No deals in the pipeline yet."
    : "No open deals assigned to you yet.";

  React.useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname, data.length]);

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>
          <InfoLabel info={seesAllDeals ? HELP.pipelineChart : HELP.myPipelineChart}>
            {seesAllDeals ? "Deals by Pipeline Stage" : "My Deals by Pipeline Stage"}
          </InfoLabel>
        </CardTitle>
        <CardDescription>
          {seesAllDeals
            ? "Open deals across active pipeline stages"
            : "Your open deals across pipeline stages"}
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex-1 pt-0">
        <div
          className="w-full md:hidden"
          style={{ height: mobileChartHeight }}
        >
          {ready ? (
            data.length > 0 ? (
              <PipelineChartMobile data={data} chartKey={chartKey} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {emptyMessage}
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
              <PipelineChartDesktop data={data} chartKey={chartKey} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {emptyMessage}
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
