"use client";

import { Area, AreaChart, CartesianGrid, Label, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useState } from "react";
import { TActionResponse, TSearchCount } from "@/lib/types";
import { toast } from "sonner";
import { Ghost } from "lucide-react";

type TSearchGraphData = {
  date: string;
} & TSearchCount;

const SearchGraph = ({
  searchCount,
}: {
  searchCount: TActionResponse<TSearchGraphData[]>;
}) => {
  const [chartData, setChartData] = useState<TSearchGraphData[]>([]);

  const chartConfig = useMemo(() => {
    return chartData.reduce((config, { date }) => {
      config[date] = { label: date };
      return config;
    }, {} as { [key: string]: { label: string } }) as ChartConfig;
  }, [chartData]);

  useEffect(() => {
    if (searchCount.success) {
      setChartData(searchCount.data);
    } else {
      toast.error(searchCount.error);
    }
  }, [searchCount]);

  return (
    <Card className="flex flex-col justify-between bg-neutral-900 border-none">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-base">Number of Searches</CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          Keyword-based Searches vs. AI-based Searches over time
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 shrink-0">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center gap-2">
            <Ghost className="size-4" />
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} className="stroke-neutral-700" />
              <YAxis>
                <Label
                  angle={-90}
                  content={({ viewBox }) => {
                    if (viewBox && "height" in viewBox && "width" in viewBox) {
                      return (
                        <text
                          x={35}
                          y={150}
                          dominantBaseline="middle"
                          fill="#808080"
                          transform="rotate(-90)"
                          className="recharts-text recharts-label"
                        >
                          <tspan
                            x={-viewBox.height! + viewBox.width! + 20}
                            y={20}
                            className="font-bold"
                          >
                            Number of searches
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </YAxis>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    className="bg-neutral-950 border-none"
                    labelKey="date"
                  />
                }
              />
              <Area
                dataKey="Total Search"
                type="natural"
                fill="var(--chart1-line3)"
                stroke="var(--chart1-line3)"
              />
              <Area
                dataKey="Keyword Search"
                type="natural"
                fill="var(--chart1-line1)"
                stroke="var(--chart1-line1)"
              />
              <Area
                dataKey="AI Search"
                type="natural"
                fill="var(--chart1-line2)"
                stroke="var(--chart1-line2)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchGraph;
