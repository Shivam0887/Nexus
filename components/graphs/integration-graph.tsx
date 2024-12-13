"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Link from "next/link";
import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { FilterKey } from "@/lib/types";

const TOTAL_PLATFORMS = 8;

const chartConfig = {
  integrations: {
    label: "Integrations",
  },
} satisfies ChartConfig;

const IntegrationGraph = ({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const [chartData, setChartData] = useState<
    { integrations: number; fill: string }[]
  >([]);
  const { user } = useUser();

  useEffect(() => {
    let integrations = 0;
    const {
      email,
      hasPasskey,
      hasSubscription,
      imageUrl,
      isAISearch,
      shouldRemember,
      plan,
      username,
      ...rest
    } = user;

    for (const key in rest) {
      if (rest[key as FilterKey].connectionStatus) {
        integrations++;
      }
    }

    setChartData([{ integrations, fill: "var(--chart3)" }]);
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card className="h-full w-full flex flex-col items-center bg-neutral-900 border-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Platform Integration</CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          Total number of Platforms integrated with Nexus
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isMounted && hasSubscription && (
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[250px] mx-auto"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={-(360 * (chartData[0].integrations / TOTAL_PLATFORMS))}
              innerRadius={80}
              outerRadius={140}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                polarRadius={[88, 75]}
                className="first:fill-neutral-800 last:fill-neutral-900"
              />
              <RadialBar dataKey="integrations" />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-[#C4D7FF] text-4xl font-bold"
                          >
                            {` ${chartData[0].integrations.toString()} / ${TOTAL_PLATFORMS}`}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-white"
                          >
                            Integrations
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/integrations"
          className="py-2 px-4 bg-neutral-950 rounded-lg text-sm transition-colors hover:bg-neutral-950/90"
        >
          Go to Integrations
        </Link>
      </CardFooter>
    </Card>
  );
};

export default IntegrationGraph;
