"use client"

import { useState } from "react"
import { ko } from "date-fns/locale"
import { isSameMonth } from "date-fns"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useMobile } from "@/hooks/use-mobile"
import { useCalendarEvents } from "@/hooks/useCalendarEvents"
import { useActivityFilters } from "@/hooks/useActivityFilters"
import { generateCalendarDays, getActivityIntensityClass, isToday, formatMonthTitle } from "@/lib/utils/calendar-utils"

// 모든 활동 유형 목록 (수면과 여가 제외)
const activityTypes = [
  { name: "일", color: "#4CAF50" }, // 초록색으로 변경
  { name: "코딩", color: "#ffc658" },
  { name: "네트워킹", color: "#ff8042" },
  { name: "운동", color: "#E91E63" }, // 분홍색으로 변경
  { name: "외출", color: "#03A9F4" }, // 밝은 파란색으로 변경
]

/**
 * 날짜에 대한 CSS 클래스를 계산합니다.
 */
function getDateClasses(day: Date, currentDate: Date, isToday: boolean, activityIntensityClass: string) {
  const isCurrentMonth = isSameMonth(day, currentDate)

  return {
    cell: `min-h-[60px] cursor-pointer rounded-md border p-1 transition-colors md:min-h-[100px] md:p-2
      ${isCurrentMonth ? activityIntensityClass : "opacity-40 bg-gray-50"}
      ${isToday ? "border-primary border-2" : ""}
      hover:border-primary`,
    date: `
      text-xs md:text-sm
      ${day.getDay() === 0 ? "text-red-500" : ""}
      ${day.getDay() === 6 ? "text-blue-500" : ""}
      ${isToday ? "font-bold text-primary" : ""}
    `,
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const isMobile = useMobile()

  // 활동 필터 훅 사용
  const { activityFilters, showFilters, setShowFilters, toggleActivityFilter, resetFilters } =
    useActivityFilters(activityTypes)

  // 캘린더 이벤트 훅 사용
  const { getEventsForDate, getDayData } = useCalendarEvents(currentDate, activityFilters)

  // 날짜 변경 함수
  const changeDate = (amount: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + amount)
    setCurrentDate(newDate)
  }

  // 오늘로 이동 함수
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 날짜 선택 함수
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  // 캘린더 그리드 생성
  const calendarDays = generateCalendarDays(currentDate)

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">캘린더</h1>
            <p className="text-sm text-muted-foreground md:text-base">활동 일정 및 계획</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday} className="text-xs md:text-sm">
                오늘
              </Button>
              <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={activityFilters.length > 0 ? "bg-primary text-primary-foreground" : ""}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">활동 필터</h4>
                  <div className="space-y-2">
                    {activityTypes.map((activity) => (
                      <div key={activity.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${activity.name}`}
                          checked={activityFilters.includes(activity.name)}
                          onCheckedChange={() => toggleActivityFilter(activity.name)}
                        />
                        <Label
                          htmlFor={`filter-${activity.name}`}
                          className="flex items-center gap-2 text-sm font-normal"
                        >
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activity.color }}></div>
                          {activity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={resetFilters}>
                      필터 초기화
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-base md:text-lg">{formatMonthTitle(currentDate, ko)}</CardTitle>
            {activityFilters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activityFilters.map((filter) => (
                  <Badge key={filter} variant="outline" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* 요일 헤더 */}
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium md:text-sm ${index === 0 ? "text-red-500" : ""} ${index === 6 ? "text-blue-500" : ""}`}
                >
                  {day}
                </div>
              ))}

              {/* 캘린더 그리드 */}
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDate(day)
                const dayData = getDayData(day)
                const todayCheck = isToday(day)
                const activityIntensityClass = dayData ? getActivityIntensityClass(dayData.stats.outdoorMinutes) : ""
                const classes = getDateClasses(day, currentDate, todayCheck, activityIntensityClass)

                return (
                  <div key={i} className={classes.cell} onClick={() => handleDateSelect(day)}>
                    <div className="flex justify-between">
                      <span className={classes.date}>{day.getDate()}</span>
                      {dayData && (
                        <span className="text-[10px] text-muted-foreground md:text-xs">
                          {dayData.stats.outdoorMinutes}분
                        </span>
                      )}
                    </div>

                    {/* 이벤트 표시 - 모바일에서는 최대 1개만 표시 */}
                    <div className="mt-1 space-y-1">
                      {dayEvents
                        .filter(
                          (event) =>
                            // hidden 속성이 true인 이벤트는 제외
                            !event.hidden &&
                            // 수면과 여가 항목 제외
                            event.type !== "수면" &&
                            event.type !== "여가",
                        )
                        .slice(0, isMobile ? 1 : 3)
                        .map((event, index) => (
                          <div
                            key={index}
                            className="truncate rounded px-1 py-0.5 text-[8px] text-white md:text-xs"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                      {isMobile &&
                        dayEvents.filter((event) => !event.hidden && event.type !== "수면" && event.type !== "여가")
                          .length > 1 && (
                          <div className="text-center text-[8px] text-muted-foreground">
                            +
                            {dayEvents.filter(
                              (event) => !event.hidden && event.type !== "수면" && event.type !== "여가",
                            ).length - 1}
                            개
                          </div>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
