"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const KRYON_CYAN = "#00AEEF";
const KRYON_TEAL_MUTED = "#6B9AA8";
const MOBILE_BAR_HEIGHT = 36;

const chartConfig = {
  count: {
    label: "Deals",
    color: KRYON_CYAN,
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
          fill={KRYON_TEAL_MUTED}
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
      fill={KRYON_TEAL_MUTED}
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
      className="h-full w-full [&_.recharts-bar-rectangle]:!fill-[#00AEEF]"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 24, right: 12, left: 4, bottom: 20 }}
      >
        <CartesianGrid vertical={false} className="stroke-border/40" />
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
          width={28}
          domain={[0, "dataMax + 1"]}
          tick={{ fill: KRYON_TEAL_MUTED, fontSize: 10 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="stage" nameKey="count" />}
        />
        <Bar
          dataKey="count"
          fill={KRYON_CYAN}
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
        >
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            offset={8}
            fill="#1B3F4B"
            fontSize={12}
            fontWeight={600}
          />
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
  const chartHeight = Math.max(180, data.length * MOBILE_BAR_HEIGHT + 16);

  return (
    <ChartContainer
      key={`mobile-${chartKey}`}
      config={chartConfig}
      className="h-full w-full [&_.recharts-bar-rectangle]:!fill-[#00AEEF]"
      style={{ minHeight: chartHeight }}
    >
      <BarChart
        accessibilityLayer
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
        barCategoryGap="20%"
      >
        <CartesianGrid horizontal={false} className="stroke-border/40" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={[0, "dataMax + 1"]}
          tick={{ fill: KRYON_TEAL_MUTED, fontSize: 10 }}
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
          cursor={false}
          content={<ChartTooltipContent labelKey="stage" nameKey="count" />}
        />
        <Bar
          dataKey="count"
          fill={KRYON_CYAN}
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
        >
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            fill="#1B3F4B"
            fontSize={11}
            fontWeight={600}
          />
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
  const mobileChartHeight = Math.max(180, data.length * MOBILE_BAR_HEIGHT + 16);
  const emptyMessage = seesAllDeals
    ? "No deals in the pipeline yet."
    : "No open deals assigned to you yet.";

  React.useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname, data.length]);

  return (
    <Card className="w-full">
      <CardHeader>
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
      <CardContent className="w-full">
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

        <div className="hidden h-[340px] w-full md:block">
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
