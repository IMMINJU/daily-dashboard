"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isSameMonth } from "date-fns"
import { mockData } from "@/lib/mock-data"

export interface CalendarEvent {
  date: string
  title: string
  type: string
  color: string
  hours?: number
  minutes?: number
  start?: number
  end?: number
  duration?: number
  hidden?: boolean
}

/**
 * 캘린더 이벤트 데이터를 관리하는 커스텀 훅
 */
export function useCalendarEvents(currentDate: Date, activityFilters: string[] = []) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // 이벤트 데이터 생성
  useEffect(() => {
    const newEvents = generateEvents(currentDate)
    setEvents(newEvents)
  }, [currentDate])

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")

    // 필터가 적용된 경우 필터링
    if (activityFilters.length > 0) {
      return events.filter(
        (event) =>
          event.date === dateString &&
          (activityFilters.includes(event.type) || event.type === "sleep" || event.type === "outdoor"),
      )
    }

    return events.filter((event) => event.date === dateString)
  }

  // 선택된 날짜의 활동 데이터 가져오기
  const getDayData = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return mockData.monthData.find((day) => day.date === dateString)
  }

  // 특정 날짜의 시간별 활동 가져오기
  const getHourlyActivitiesForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const dayData = mockData.monthData.find((day) => day.date === dateString)
    return dayData ? dayData.hourlyActivity : []
  }

  return {
    events,
    getEventsForDate,
    getDayData,
    getHourlyActivitiesForDate,
  }
}

/**
 * 현재 날짜에 대한 이벤트 데이터를 생성합니다.
 */
function generateEvents(currentDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []

  for (const day of mockData.monthData) {
    const date = parseISO(day.date)

    // 현재 표시 중인 달에 해당하는 데이터만 필터링
    if (isSameMonth(date, currentDate)) {
      // 이미 추가된 활동 유형을 추적하기 위한 Set
      const addedActivityTypes = new Set()

      // 가장 높은 비율의 활동 유형 찾기 (수면과 여가 제외)
      const highestActivity = [...day.activityTypes]
        .filter((type) => type.name !== "수면" && type.name !== "여가")
        .sort((a, b) => b.value - a.value)[0]

      if (highestActivity) {
        events.push({
          date: day.date,
          title: highestActivity.name,
          type: highestActivity.name,
          color: highestActivity.color,
          hours: highestActivity.value,
        })

        // 추가된 활동 유형 기록
        addedActivityTypes.add(highestActivity.name)
      }

      // 모든 활동 유형 이벤트 추가 (수면과 여가 제외, 중복 제거)
      day.activityTypes.forEach((activity) => {
        if (
          activity.value > 0 &&
          activity.name !== "수면" &&
          activity.name !== "여가" &&
          !addedActivityTypes.has(activity.name)
        ) {
          events.push({
            date: day.date,
            title: activity.name,
            type: activity.name,
            color: activity.color,
            hours: activity.value,
          })

          // 추가된 활동 유형 기록
          addedActivityTypes.add(activity.name)
        }
      })

      // 수면 시간 이벤트 - 내부 데이터로만 사용하고 라벨에는 표시하지 않음
      const sleepStatus =
        day.stats.sleepHours >= 7 ? "충분한 수면" : day.stats.sleepHours >= 6 ? "적정 수면" : "수면 부족"

      events.push({
        date: day.date,
        title: sleepStatus,
        type: "sleep",
        color: day.stats.sleepHours >= 7 ? "#4CAF50" : day.stats.sleepHours >= 6 ? "#FFC107" : "#F44336",
        hours: day.stats.sleepHours,
        hidden: true, // 라벨에서 숨김 처리
      })

      // 외출 시간 이벤트 (이미 추가되지 않은 경우에만)
      if (day.stats.outdoorMinutes > 0 && !addedActivityTypes.has("외출")) {
        events.push({
          date: day.date,
          title: "외출",
          type: "outdoor",
          color: "#03A9F4", // 밝은 파란색으로 변경
          minutes: day.stats.outdoorMinutes,
        })

        // 추가된 활동 유형 기록
        addedActivityTypes.add("외출")
      }

      // 시간별 활동 추가 (수면과 여가 제외, 중복 제거)
      day.hourlyActivity.forEach((activity) => {
        if (activity.name !== "수면" && activity.name !== "여가" && !addedActivityTypes.has(activity.name)) {
          let duration = activity.end - activity.start
          if (activity.end < activity.start) {
            duration = 24 - activity.start + activity.end
          }

          events.push({
            date: day.date,
            title: activity.name,
            type: activity.name,
            color: day.activityTypes.find((t) => t.name === activity.name)?.color || "#666",
            start: activity.start,
            end: activity.end,
            duration,
          })

          // 추가된 활동 유형 기록
          addedActivityTypes.add(activity.name)
        }
      })
    }
  }

  return events
}
