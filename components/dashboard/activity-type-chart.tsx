"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { ActivityType } from "@/types"

interface ActivityTypeChartProps {
  data: ActivityType[]
}

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  // 0시간인 활동 필터링
  const filteredData = data.filter((item) => item.value && item.value > 0)

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      // 0시간인 활동은 툴팁 표시하지 않음
      if (data.value === 0) return null

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm xl:p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full xl:h-4 xl:w-4" style={{ backgroundColor: data.color }} />
              <span className="font-medium xl:text-base">{data.name}</span>
            </div>
            <div className="text-right text-sm xl:text-base">
              <span className="font-medium">{data.value}시간</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] xl:h-full">
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
            className="xl:text-base"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" className="xl:text-base" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
