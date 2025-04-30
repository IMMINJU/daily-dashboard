"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ActivityTypeChart } from "./activity-type-chart"
import { WeeklyActivityChart } from "./weekly-activity-chart"
import { useDashboardData } from "@/hooks/useDashboardData"
import { MetricCard } from "./metric-card"
import { mockData } from "@/lib/mock-data"
import { ACTIVITY_CONSTANTS } from "@/constants/activity-types"

export function DailyDashboard() {
  // mock 데이터에서 가장 최신 날짜 가져오기
  const latestDate = useMemo(() => {
    // monthData가 날짜순으로 정렬되어 있다고 가정하면 마지막 요소가 최신 날짜
    const latestDateStr = mockData.monthData[mockData.monthData.length - 1].date
    return new Date(latestDateStr)
  }, [])

  const [date, setDate] = useState<Date | undefined>(latestDate)

  const { selectedData, previousDayData, weeklyActivityData, fromDate, toDate, calculateChange, hasDataForDate } =
    useDashboardData(date)

  // 데이터가 없는 경우만 처리
  if (!selectedData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p>선택한 날짜에 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">일일 활동 대시보드</h1>
          <p className="text-muted-foreground">
            {date ? format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko }) : "하루 패턴을 한눈에 파악하세요"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                aria-label="날짜 선택"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ko }) : <span>날짜 선택</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={ko}
                fromDate={fromDate}
                toDate={toDate}
                modifiers={{
                  hasData: (date) => hasDataForDate(date),
                }}
                modifiersClassNames={{
                  hasData: "font-bold text-primary",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 핵심 메트릭 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 수면 시간 */}
        <MetricCard
          title="수면 시간"
          value={`${selectedData.stats.sleepHours}시간`}
          progressValue={(selectedData.stats.sleepHours / ACTIVITY_CONSTANTS.OPTIMAL_SLEEP_HOURS) * 100}
          progressColor="#8884d8"
          previousValue={previousDayData?.stats.sleepHours}
          currentValue={selectedData.stats.sleepHours}
          calculateChange={calculateChange}
          unit="시간"
        />

        {/* 외출 시간 */}
        <MetricCard
          title="외출 시간"
          value={`${selectedData.stats.outdoorMinutes}분`}
          progressValue={(selectedData.stats.outdoorMinutes / ACTIVITY_CONSTANTS.OPTIMAL_OUTDOOR_MINUTES) * 100}
          progressColor="#03A9F4"
          previousValue={previousDayData?.stats.outdoorMinutes}
          currentValue={selectedData.stats.outdoorMinutes}
          calculateChange={calculateChange}
          unit="분"
        />
      </div>

      {/* 일일 활동 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>일일 활동 요약</CardTitle>
          <CardDescription>활동 유형별 시간 분배</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityTypeChart data={selectedData.activityTypes} />
        </CardContent>
      </Card>

      {/* 주간 활동 패턴 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 활동 패턴</CardTitle>
          <CardDescription>이번 주 전체 활동 패턴</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <WeeklyActivityChart data={weeklyActivityData} />
        </CardContent>
      </Card>
    </div>
  )
}
