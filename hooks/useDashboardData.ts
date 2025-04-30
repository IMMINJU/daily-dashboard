"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { mockData } from "@/lib/mock-data"
import type { DayData } from "@/types"

/**
 * 대시보드 데이터를 처리하는 커스텀 훅
 * @param date 선택된 날짜
 * @returns 처리된 대시보드 데이터와 관련 함수들
 */
export function useDashboardData(date: Date | undefined) {
  const [selectedData, setSelectedData] = useState<DayData | null>(null)
  const [previousDayData, setPreviousDayData] = useState<DayData | null>(null)
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([])

  // 캘린더에 표시할 날짜 범위 계산
  const availableDates = useMemo(() => {
    return mockData.monthData.map((day) => new Date(day.date)).sort((a, b) => a.getTime() - b.getTime())
  }, [])

  // 가장 빠른 날짜와 가장 늦은 날짜
  const fromDate = useMemo(() => availableDates[0], [availableDates])
  const toDate = useMemo(() => availableDates[availableDates.length - 1], [availableDates])

  // 날짜 변경 시 데이터 업데이트
  useMemo(() => {
    if (!date) return

    const dateString = format(date, "yyyy-MM-dd")
    const selectedDayData = mockData.monthData.find((day) => day.date === dateString)

    if (selectedDayData) {
      // 전날 데이터 찾기
      const prevDateIndex = mockData.monthData.findIndex((day) => day.date === dateString) - 1
      const prevDayData = prevDateIndex >= 0 ? mockData.monthData[prevDateIndex] : null

      // 선택한 날짜의 주간 데이터 찾기
      const weekData = mockData.weeklyData.find((week) => week.startDate <= dateString && week.endDate >= dateString)

      // 주간 활동 데이터 계산
      const weeklyActivityData = []

      if (weekData) {
        // 해당 주의 모든 날짜 데이터 찾기
        const daysInWeek = mockData.monthData.filter(
          (day) => day.date >= weekData.startDate && day.date <= weekData.endDate,
        )

        // 활동 유형 목록
        const activityTypes = ["수면", "일", "여가", "코딩", "네트워킹", "외출"]

        // 각 날짜별 활동 데이터 추출
        daysInWeek.forEach((day) => {
          const dayData = {
            date: day.date,
            day: weekData.dailyData.find((d) => d.date === day.date)?.day || "",
            isToday: day.date === dateString,
          }

          // 각 활동 유형별 시간 추가
          day.activityTypes.forEach((activity) => {
            dayData[activity.name] = activity.value
          })

          weeklyActivityData.push(dayData)
        })
      }

      setSelectedData(selectedDayData)
      setPreviousDayData(prevDayData)
      setWeeklyActivityData(weeklyActivityData)
    }
  }, [date])

  // 메트릭 변화율 계산 함수
  const calculateChange = (current: number, previous: number): number | null => {
    if (!previous) return null
    return ((current - previous) / previous) * 100
  }

  // 캘린더에 표시할 날짜에 데이터가 있는지 확인하는 함수
  const hasDataForDate = (date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd")
    return mockData.monthData.some((day) => day.date === dateString)
  }

  return {
    selectedData,
    previousDayData,
    weeklyActivityData,
    fromDate,
    toDate,
    calculateChange,
    hasDataForDate,
  }
}
