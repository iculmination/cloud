"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { convertFileSize } from "@/lib/utils";

const Chart = ({ totalUsedSpace }: { totalUsedSpace: StorageUsage }) => {
  const usedPercentage = (totalUsedSpace.used / totalUsedSpace.all) * 100;

  const chartData = [
    {
      name: "Used Storage",
      value: usedPercentage,
      fill: "white",
    },
  ];

  const chartConfig = {
    value: {
      label: "Used Storage",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="bg-brand w-full h-80 lg:h-60 rounded-3xl flex flex-col lg:flex-row min-w-60">
      <ChartContainer
        className="w-[174px] mx-auto lg:mx-0 lg:w-1/2 h-56 lg:h-60"
        config={chartConfig}
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={-270}
          innerRadius={80}
          outerRadius={110}
        >
          <PolarGrid
            gridType="circle"
            fill="gray"
            radialLines={false}
            stroke="hsl(var(--muted-foreground))"
            polarRadius={[86, 74]}
          />

          <RadialBar dataKey="value" fill="white" cornerRadius={10} />
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
                        className=" text-4xl fill-white font-bold"
                      >
                        {usedPercentage.toFixed(1)}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-light-400"
                      >
                        Space Used
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>

      <div className="w-full lg:w-1/2 text-white flex flex-col justify-center items-center lg:items-start">
        <h3 className="h3">Available Storage</h3>
        <p>
          {convertFileSize(totalUsedSpace.all - totalUsedSpace.used)} /{" "}
          {convertFileSize(totalUsedSpace.all)}
        </p>
      </div>
    </div>
  );
};

export default Chart;
