
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
      className="mx-auto aspect-square h-[600px]"
    >
        <RadarChart
            data={data}
            margin={{ top: 120, right: 120, bottom: 120, left: 120 }}
        >
          <PolarGrid />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 14,
              fontWeight: 500
            }}
            tickFormatter={(value) => {
              // Use shorter, abbreviated labels that fit better
              const labels = {
                "Ritmo & Estrutura": "Ritmo &\nEstrutura",
                "Interação Social": "Interação\nSocial",
                "Fonte de Energia": "Fonte de\nEnergia",
                "Absorção de Conteúdo": "Absorção\nConteúdo"
              };
              return labels[value as keyof typeof labels] || value;
            }}
            dy={15}
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
    </ChartContainer>
  )
}
