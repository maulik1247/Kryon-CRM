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
import { InfoLabel } from "@/components/shared/info-tip";
import { useAuth } from "@/lib/auth-provider";
import { useCrmData } from "@/lib/crm-data-provider";
import { getOpenDealsByConfidence } from "@/lib/deal-helpers";
import { HELP } from "@/lib/help-content";
import { filterDealsForUser } from "@/lib/user-helpers";

const KRYON_TEAL_MUTED = "#6B9AA8";
const MOBILE_BAR_HEIGHT = 36;

const chartConfig = {
  count: {
    label: "Deals",
    color: "#00AEEF",
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
}: {
  data: ConfidenceChartDatum[];
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
        margin={{ top: 24, right: 12, left: 4, bottom: 8 }}
      >
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tick={{ fill: KRYON_TEAL_MUTED, fontSize: 11 }}
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
          content={<ChartTooltipContent labelKey="label" nameKey="count" />}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
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

function ConfidenceChartMobile({
  data,
  chartKey,
}: {
  data: ConfidenceChartDatum[];
  chartKey: string;
}) {
  const chartHeight = Math.max(160, data.length * MOBILE_BAR_HEIGHT + 16);

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
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fill: KRYON_TEAL_MUTED, fontSize: 11 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="label" nameKey="count" />}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
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

  const chartKey = `${pathname}-${currentUser.id}-${data.map((d) => d.count).join("-")}`;
  const mobileChartHeight = Math.max(160, data.length * MOBILE_BAR_HEIGHT + 16);

  React.useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname, data.length]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <InfoLabel info={HELP.myConfidenceChart}>
            My Deals by Confidence
          </InfoLabel>
        </CardTitle>
        <CardDescription>
          Open deals grouped by win probability
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div
          className="w-full md:hidden"
          style={{ height: mobileChartHeight }}
        >
          {ready ? (
            data.length > 0 ? (
              <ConfidenceChartMobile data={data} chartKey={chartKey} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No open deals to show yet.
              </p>
            )
          ) : (
            <ChartSkeleton className="h-full" />
          )}
        </div>

        <div className="hidden h-[280px] w-full md:block">
          {ready ? (
            data.length > 0 ? (
              <ConfidenceChartDesktop data={data} chartKey={chartKey} />
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
