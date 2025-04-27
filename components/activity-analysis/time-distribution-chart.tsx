"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ActivityType, TimeDistributionData } from "@/types"

interface TimeDistributionChartProps {
  data: TimeDistributionData[]
  activity: ActivityType
}

export function TimeDistributionChart({ data, activity }: TimeDistributionChartProps) {
  // 데이터 가공
  const chartData = data.map((item) => ({
    hour: item.hour.toString().padStart(2, "0"),
    percentage: Number(item.percentage.toFixed(1)),
  }))

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            label={{ value: "시간", position: "insideBottom", offset: -5 }}
            interval={1}
            tick={{ fontSize: 10 }}
          />
          <YAxis label={{ value: "발생 확률 (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value) => [`${value}%`, "발생 확률"]} labelFormatter={(label) => `${label}:00`} />
          <Bar dataKey="percentage" fill={activity.color} name="발생 확률" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
