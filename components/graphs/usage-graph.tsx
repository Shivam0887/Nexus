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
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

const chartConfig = {
  "AI Search": {
    label: "AI Search Credits",
    color: "var(--chart4-curve1)",
  },
  "AI Chat": {
    label: "AI Chat",
    color: "var(--chart4-curve2)",
  },
} satisfies ChartConfig;

const UsageGraph = () => {
  const [chartData, setChartData] = useState([
    { "AI Search": 10, "AI Chat": 5 },
  ]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(420 >= width);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="flex flex-col bg-neutral-900 border-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Credit Usage</CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          Track your credits- AI-based search, chats, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 shrink-0 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={-(360 * (10 / 20))}
            innerRadius={isMobile ? 55 : 80}
            outerRadius={isMobile ? 90 : 140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={isMobile ? [60, 50] : [88, 75]}
              className="first:fill-neutral-800 last:fill-neutral-900"
            />
            <RadialBar dataKey="AI Search" fill="var(--chart4-curve1)" />
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
                          className={`fill-[#C4D7FF] ${
                            isMobile ? "text-xl" : "text-4xl"
                          } font-bold`}
                        >
                          {chartData[0]["AI Search"].toString()} / 20
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-white text-xs"
                        >
                          credits used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={-(360 * (5 / 20))}
            innerRadius={isMobile ? 55 : 80}
            outerRadius={isMobile ? 90 : 140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={isMobile ? [60, 50] : [88, 75]}
              className="first:fill-neutral-800 last:fill-neutral-900"
            />
            <RadialBar dataKey="AI Chat" fill="var(--chart4-curve2)" />
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
                          className={`fill-[#C4D7FF] ${
                            isMobile ? "text-xl" : "text-4xl"
                          } font-bold`}
                        >
                          {chartData[0]["AI Chat"].toString()} / 20
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-white text-xs"
                        >
                          credits used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-around">
        <div className="py-2 px-4 bg-neutral-950 rounded-lg text-sm transition-colors hover:bg-neutral-950/90">
          AI Search Credits
        </div>
        <div className="py-2 px-4 bg-neutral-950 rounded-lg text-sm transition-colors hover:bg-neutral-950/90">
          AI Chat Credits
        </div>
      </CardFooter>
    </Card>
  );
};

export default UsageGraph;