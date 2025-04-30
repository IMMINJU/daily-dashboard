"use client"

import { useState } from "react"
import { ko } from "date-fns/locale"
import { isSameMonth } from "date-fns"
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
import { CALENDAR_ACTIVITY_TYPES } from "@/constants/activity-types"

// 모든 활동 유형 목록 (수면과 여가 제외)
const activityTypes = CALENDAR_ACTIVITY_TYPES

/**
 * 날짜에 대한 CSS 클래스를 계산합니다.
 */
function getDateClasses(day: Date, currentDate: Date, isToday: boolean, activityIntensityClass: string) {
  const isCurrentMonth = isSameMonth(day, currentDate)

  return {
    cell: `min-h-[60px] cursor-pointer rounded-md border p-1 transition-colors md:min-h-[100px] lg:min-h-[120px] xl:min-h-[150px] md:p-2 lg:p-3
      ${isCurrentMonth ? activityIntensityClass : "opacity-40 bg-gray-50"}
      ${isToday ? "border-primary border-2" : ""}
      hover:border-primary`,
    date: `
      text-xs md:text-sm lg:text-base
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

  // 선택된 날짜의 상세 정보
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []
  const selectedDateData = selectedDate ? getDayData(selectedDate) : null

  return (
    <div className="space-y-4 md:space-y-6 xl:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-3xl xl:text-4xl">캘린더</h1>
          <p className="text-sm text-muted-foreground md:text-base xl:text-lg">활동 일정 및 계획</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4 xl:h-5 xl:w-5" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="text-xs md:text-sm xl:text-base">
              오늘
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4 xl:h-5 xl:w-5" />
            </Button>
          </div>

          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={activityFilters.length > 0 ? "bg-primary text-primary-foreground" : ""}
              >
                <Filter className="h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4 lg:w-72 lg:p-6">
              <div className="space-y-2">
                <h4 className="font-medium lg:text-lg">활동 필터</h4>
                <div className="space-y-2">
                  {activityTypes.map((activity) => (
                    <div key={activity.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${activity.name}`}
                        checked={activityFilters.includes(activity.name)}
                        onCheckedChange={() => toggleActivityFilter(activity.name)}
                        className="lg:h-5 lg:w-5"
                      />
                      <Label
                        htmlFor={`filter-${activity.name}`}
                        className="flex items-center gap-2 text-sm font-normal lg:text-base"
                      >
                        <div
                          className="h-3 w-3 rounded-full lg:h-4 lg:w-4"
                          style={{ backgroundColor: activity.color }}
                        ></div>
                        {activity.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm" onClick={resetFilters}>
                    필터 초기화
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[3fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-base md:text-lg lg:text-xl">{formatMonthTitle(currentDate, ko)}</CardTitle>
            {activityFilters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activityFilters.map((filter) => (
                  <Badge key={filter} variant="outline" className="text-xs lg:text-sm">
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-2 md:p-4 lg:p-6">
            <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
              {/* 요일 헤더 */}
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium md:text-sm lg:text-base ${index === 0 ? "text-red-500" : ""} ${index === 6 ? "text-blue-500" : ""}`}
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
                        <span className="text-[10px] text-muted-foreground md:text-xs lg:text-sm">
                          {dayData.stats.outdoorMinutes}분
                        </span>
                      )}
                    </div>

                    {/* 이벤트 표시 - 모바일에서는 최대 1개, 태블릿에서는 최대 3개, 데스크탑에서는 최대 5개 표시 */}
                    <div className="mt-1 space-y-1 lg:mt-2 lg:space-y-2">
                      {dayEvents
                        .filter(
                          (event) =>
                            // hidden 속성이 true인 이벤트는 제외
                            !event.hidden &&
                            // 수면과 여가 항목 제외
                            event.type !== "수면" &&
                            event.type !== "여가",
                        )
                        .slice(0, isMobile ? 1 : window.innerWidth >= 1280 ? 5 : 3)
                        .map((event, index) => (
                          <div
                            key={index}
                            className="truncate rounded px-1 py-0.5 text-[8px] text-white md:text-xs lg:text-sm"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                      {isMobile &&
                        dayEvents.filter((event) => !event.hidden && event.type !== "수면" && event.type !== "여가")
                          .length > 1 && (
                          <div className="text-center text-[8px] text-muted-foreground lg:text-xs">
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

        {/* 선택된 날짜 상세 정보 패널 (데스크탑에서만 표시) */}
        <div className="hidden xl:block">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
                  : "날짜를 선택하세요"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {selectedDateData ? (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-medium">활동 요약</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">수면 시간:</div>
                          <div className="text-right font-medium">{selectedDateData.stats.sleepHours}시간</div>
                          <div className="text-muted-foreground">외출 시간:</div>
                          <div className="text-right font-medium">{selectedDateData.stats.outdoorMinutes}분</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">활동 목록</h3>
                        <div className="space-y-2">
                          {selectedDateEvents
                            .filter((event) => !event.hidden)
                            .map((event, index) => (
                              <div key={index} className="rounded-md border p-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color }}></div>
                                  <span className="font-medium">{event.title}</span>
                                </div>
                                {event.hours && (
                                  <div className="mt-1 text-xs text-muted-foreground">{event.hours}시간</div>
                                )}
                                {event.minutes && (
                                  <div className="mt-1 text-xs text-muted-foreground">{event.minutes}분</div>
                                )}
                                {event.start !== undefined && event.end !== undefined && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {event.start}:00 - {event.end}:00
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">선택한 날짜에 데이터가 없습니다.</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">날짜를 선택하면 상세 정보가 표시됩니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
