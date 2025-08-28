"use client"

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, Legend } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CardDescription } from "../ui/card"

const chartConfig = {
  d: {
    label: "Dominance",
    color: "hsl(var(--chart-1))",
  },
  i: {
    label: "Influence",
    color: "hsl(var(--chart-2))",
  },
}

export function DiscChart({ data }: { data: any[] }) {
  return (
      <>
        <CardDescription>Influence vs. Dominance</CardDescription>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ScatterChart
            margin={{
            left: -20,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" name="Influence" unit="" label={{ value: 'Influence', position: 'insideBottom', offset: -10 }} />
            <YAxis dataKey="d" type="number" name="Dominance" unit="" label={{ value: 'Dominance', angle: -90, position: 'insideLeft' }}/>
            <ChartTooltip
            cursor={{
                strokeDasharray: "3 3",
            }}
            content={<ChartTooltipContent hideLabel />}
            />
            <Scatter name="Students" data={data} fill="var(--color-i)" />
        </ScatterChart>
        </ChartContainer>
    </>
  )
}
