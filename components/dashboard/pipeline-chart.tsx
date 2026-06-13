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
import { InfoLabel } from "@/components/shared/info-tip";
import { HELP } from "@/lib/help-content";

const KRYON_CYAN = "#00AEEF";
const KRYON_TEAL_MUTED = "#6B9AA8";

const chartConfig = {
  count: {
    label: "Deals",
    color: KRYON_CYAN,
  },
} satisfies ChartConfig;

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

export function PipelineChart() {
  const pathname = usePathname();
  const { deals, pipelineStages } = useCrmData();
  const [ready, setReady] = React.useState(false);

  const data = getDealsPerStage(deals, pipelineStages).map((item) => ({
    stage: item.stage,
    count: item.count,
    color: item.color,
  }));

  // Recharts ResponsiveContainer needs a fresh layout pass after client navigation.
  React.useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname, data.length]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <InfoLabel info={HELP.pipelineChart}>
            Deals by Pipeline Stage
          </InfoLabel>
        </CardTitle>
        <CardDescription>Open deals across active pipeline stages</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="h-[340px] w-full">
          {ready ? (
            <ChartContainer
              key={`${pathname}-${data.map((d) => d.count).join("-")}`}
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
                  content={
                    <ChartTooltipContent labelKey="stage" nameKey="count" />
                  }
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
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-muted/40" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
