"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingDown, TrendingUp, Calendar } from "lucide-react"
import type { ActivityType, ActivityData } from "@/types"

interface ActivityStatsProps {
  activity: ActivityType
  data: ActivityData
}

export function ActivityStats({ activity, data }: ActivityStatsProps) {
  // 평균 시간 계산
  const totalHours = data.dailyData.reduce((sum, day) => sum + day.hours, 0)
  const avgHours = (totalHours / data.dailyData.length).toFixed(1)

  // 최대/최소 시간 및 날짜 찾기
  const maxDay = [...data.dailyData].sort((a, b) => b.hours - a.hours)[0]
  const minDay = [...data.dailyData].filter((day) => day.hours > 0).sort((a, b) => a.hours - b.hours)[0]

  // 평일/주말 평균 계산
  const weekdayData = data.dailyData.filter((day) => !day.isWeekend)
  const weekendData = data.dailyData.filter((day) => day.isWeekend)

  const avgWeekdayHours =
    weekdayData.length > 0
      ? (weekdayData.reduce((sum, day) => sum + day.hours, 0) / weekdayData.length).toFixed(1)
      : "0.0"

  const avgWeekendHours =
    weekendData.length > 0
      ? (weekendData.reduce((sum, day) => sum + day.hours, 0) / weekendData.length).toFixed(1)
      : "0.0"

  // 가장 많이 발생하는 시간대 찾기
  const peakHour = [...data.timeDistribution].sort((a, b) => b.percentage - a.percentage)[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 {activity.name} 시간</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgHours}시간/일</div>
          <p className="text-xs text-muted-foreground">
            평일 {avgWeekdayHours}시간 | 주말 {avgWeekendHours}시간
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최대 {activity.name} 시간</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{maxDay.hours}시간</div>
          <p className="text-xs text-muted-foreground">
            {new Date(maxDay.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최소 {activity.name} 시간</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{minDay ? minDay.hours : "0"}시간</div>
          <p className="text-xs text-muted-foreground">
            {minDay
              ? new Date(minDay.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
              : "데이터 없음"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">주요 {activity.name} 시간대</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{peakHour.hour}:00</div>
          <p className="text-xs text-muted-foreground">발생 확률 {peakHour.percentage.toFixed(1)}%</p>
        </CardContent>
      </Card>
    </div>
  )
}
