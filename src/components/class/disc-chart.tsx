"use client"

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CardDescription } from "../ui/card"

const chartConfig = {
  d: {
    label: "Dominância",
    color: "hsl(var(--chart-1))",
  },
  i: {
    label: "Influência",
    color: "hsl(var(--chart-2))",
  },
}

export function DiscChart({ data }: { data: any[] }) {
  return (
      <>
        <CardDescription>Influência (Colaborativo) vs. Dominância (Focado em Tarefas)</CardDescription>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
        <ScatterChart
            margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="i" type="number" name="Influência" domain={[-10, 10]} label={{ value: 'Influência →', position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="d" type="number" name="Dominância" domain={[-10, 10]} label={{ value: 'Dominância →', angle: -90, position: 'insideLeft', offset: 10 }} />
            <ChartTooltip
            cursor={{
                strokeDasharray: "3 3",
            }}
            content={<ChartTooltipContent hideLabel />}
            />
            <Scatter name="Alunos" data={data} fill="var(--color-primary)" />
        </ScatterChart>
        </ResponsiveContainer>
        </ChartContainer>
    </>
  )
}
