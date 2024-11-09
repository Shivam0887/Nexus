"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import {
  CombinedFilterKey,
  FilterKey,
  TActionResponse,
  TSearchResult,
} from "@/lib/types";
import { toast } from "sonner";

const chartConfig: {
  [key in Exclude<CombinedFilterKey, "GOOGLE_CALENDAR" | "GOOGLE_DRIVE">]: {
    label: string;
    color: string;
  };
} = {
  GMAIL: {
    label: "Gmail",
    color: "var(--chart2-bar1)",
  },
  GOOGLE_DOCS: {
    label: "Google Docs",
    color: "var(--chart2-bar2)",
  },
  GOOGLE_SHEETS: {
    label: "Google Sheets",
    color: "var(--chart2-bar3)",
  },
  GOOGLE_SLIDES: {
    label: "Google Slides",
    color: "var(--chart2-bar4)",
  },
  SLACK: {
    label: "Slack",
    color: "var(--chart2-bar5)",
  },
  DISCORD: {
    label: "Discord",
    color: "var(--chart2-bar6)",
  },
  NOTION: {
    label: "Notion",
    color: "var(--chart2-bar7)",
  },
  GITHUB: {
    label: "GitHub",
    color: "var(--chart2-bar8)",
  },
  MICROSOFT_TEAMS: {
    label: "Microsoft Teams",
    color: "var(--chart2-bar9)",
  },
} satisfies ChartConfig;

const SearchResultGraph = ({
  searchResultCount,
}: {
  searchResultCount: TActionResponse<TSearchResult>;
}) => {
  const [chartData, setChartData] = useState<
    {
      platform: string;
      results: number;
    }[]
  >([]);

  useEffect(() => {
    if (searchResultCount.success) {
      const data = Object.entries(searchResultCount.data).map(
        ([platform, results]) => ({
          platform,
          results,
          fill: chartConfig[
            platform as Exclude<
              CombinedFilterKey,
              "GOOGLE_CALENDAR" | "GOOGLE_DRIVE"
            >
          ].color,
        })
      );
      setChartData(data);
    } else {
      toast.error(searchResultCount.error);
    }
  }, [searchResultCount]);

  return (
    <Card className="flex flex-col bg-neutral-900 border-none">
      <CardHeader className="items-center">
        <CardTitle className="text-base">Search Results by Platform</CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          Total number of search results per platform
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 shrink-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="platform"
              type="category"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="results" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="bg-neutral-950 border-none"
                />
              }
            />
            <Bar dataKey="results" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SearchResultGraph;
