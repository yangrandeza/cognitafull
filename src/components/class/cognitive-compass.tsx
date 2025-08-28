
"use client"

import * as React from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

import {
  ChartContainer
} from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
}

interface CognitiveCompassProps {
  data: {
    axis: string;
    value: number;
  }[];
}

export function CognitiveCompass({ data }: CognitiveCompassProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[350px]"
    >
      <ResponsiveContainer>
        <RadarChart 
            data={data} 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="axis" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
          />
          <PolarRadiusAxis 
            angle={45} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false}
          />
          <Radar
            name="Turma"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
        </RadarChart>
      </responsivecontainer>
    </ChartContainer>
  )
}
