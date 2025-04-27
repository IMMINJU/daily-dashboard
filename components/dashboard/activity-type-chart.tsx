"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { ActivityType } from "@/types"

interface ActivityTypeChartProps {
  data: ActivityType[]
}

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  // 0시간인 활동 필터링
  const filteredData = data.filter((item) => item.value && item.value > 0)

  // 커스텀 툴팁 컨텐츠 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      // 0시간인 활동은 툴팁 표시하지 않음
      if (data.value === 0) return null

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="text-right text-sm">
              <span className="font-medium">{data.value}시간</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => (value > 0 ? `${name} ${value}시간` : null)}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
