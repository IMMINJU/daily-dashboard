"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import type { ActivityType } from "@/types"

interface TrendChartProps {
  data: any[]
  activity: ActivityType
  timeFrame: "daily" | "weekly"
}

export function TrendChart({ data, activity, timeFrame }: TrendChartProps) {
  // 데이터 가공
  const chartData =
    timeFrame === "daily"
      ? data.map((day) => ({
          date: new Date(day.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
          hours: Math.round(day.hours),
          isWeekend: day.isWeekend,
        }))
      : data.map((week) => ({
          week: week.week,
          hours: Math.round(week.avgHours),
        }))

  // 평균 계산
  const avgHours =
    timeFrame === "daily"
      ? data.reduce((sum, day) => sum + day.hours, 0) / data.length
      : data.reduce((sum, week) => sum + week.avgHours, 0) / data.length

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={timeFrame === "daily" ? "date" : "week"}
            interval={timeFrame === "daily" ? 2 : 0}
            tick={{ fontSize: 10 }}
          />
          <YAxis label={{ value: "시간 (시간/일)", angle: -90, position: "insideLeft" }} domain={[0, "dataMax + 1"]} />
          <Tooltip
            formatter={(value) => [`${value}시간`, activity.name]}
            labelFormatter={(label) => (timeFrame === "daily" ? `${label}` : `${label} 주`)}
          />
          <ReferenceLine y={avgHours} stroke="#666" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="hours"
            stroke={activity.color}
            strokeWidth={2}
            dot={{ fill: activity.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
