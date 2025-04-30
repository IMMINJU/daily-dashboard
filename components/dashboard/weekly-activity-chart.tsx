"use client"

import React, { useMemo } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ACTIVITY_TYPES } from "@/constants/activity-types"

interface WeeklyActivityChartProps {
  data: any[]
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  // 활동 유형 및 색상 정의
  const activityTypes = useMemo(() => ACTIVITY_TYPES, [])

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    // 해당 날짜의 데이터 찾기
    const dayData = data.find((day) => day.day === label)

    // 활동 시간 합계 계산 (수면 제외)
    const totalActivityHours = payload.reduce((sum, entry) => {
      // 수면은 제외하고 합계 계산
      if (entry.name !== "수면") {
        return sum + (entry.value || 0)
      }
      return sum
    }, 0)

    // 생산적 활동 시간 계산 (일, 코딩, 네트워킹)
    const productiveHours = payload.reduce((sum, entry) => {
      if (["일", "코딩", "네트워킹"].includes(entry.name)) {
        return sum + (entry.value || 0)
      }
      return sum
    }, 0)

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm xl:p-4">
        <div className="mb-2 font-medium flex items-center justify-between xl:text-lg">
          <span>{label}요일</span>
          {dayData?.isToday && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full xl:text-sm xl:px-2 xl:py-1">
              오늘
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 xl:gap-3">
          {payload.map((entry, index) => {
            // 값이 0인 항목은 표시하지 않음
            if (entry.value === 0) return null

            return (
              <React.Fragment key={index}>
                <div className="flex items-center gap-1 text-sm text-muted-foreground xl:text-base">
                  <div className="h-2 w-2 rounded-full xl:h-3 xl:w-3" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </div>
                <div className="text-right text-sm font-medium xl:text-base">{entry.value}시간</div>
              </React.Fragment>
            )
          })}

          {/* 구분선 */}
          <div className="col-span-2 my-1 border-t border-border xl:my-2"></div>

          {/* 요약 정보 */}
          <div className="text-sm text-muted-foreground xl:text-base">생산적 활동:</div>
          <div className="text-right text-sm font-medium xl:text-base">{productiveHours}시간</div>

          <div className="text-sm text-muted-foreground xl:text-base">총 활동 시간:</div>
          <div className="text-right text-sm font-medium xl:text-base">{totalActivityHours}시간</div>

          {dayData && (
            <>
              <div className="text-sm text-muted-foreground xl:text-base">날짜:</div>
              <div className="text-right text-sm font-medium xl:text-base">
                {new Date(dayData.date).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} aria-label="요일" className="xl:text-base" />
        <YAxis
          label={{ value: "시간", angle: -90, position: "insideLeft" }}
          tick={{ fontSize: 12 }}
          aria-label="시간"
          className="xl:text-base"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend className="xl:text-base" />
        {activityTypes.map((type) => (
          <Line
            key={type.name}
            type="monotone"
            dataKey={type.name}
            stroke={type.color}
            activeDot={type.name === "수면" ? { r: 8 } : { r: 5 }}
            strokeWidth={type.name === "수면" ? 2 : 1.5}
            dot={{ r: 3 }}
            name={type.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
