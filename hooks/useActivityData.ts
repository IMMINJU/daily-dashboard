"use client"

import { useMemo } from "react"
import type { ActivityType, ActivityData } from "@/types"
import { mockData } from "@/lib/mock-data"
import { ACTIVITY_TYPES } from "@/constants/activity-types"

/**
 * 활동 데이터를 처리하는 커스텀 훅
 * @param selectedActivity 선택된 활동 유형
 * @returns 처리된 활동 데이터
 */
export function useActivityData(selectedActivity: ActivityType) {
  // 모든 데이터 처리를 useMemo로 변경
  const activityData = useMemo<ActivityData>(() => {
    // 일별 데이터 추출
    const dailyData = mockData.monthData.map((day) => {
      // 해당 활동의 시간 찾기
      const activityTypeData = day.activityTypes.find((type) => type.name === selectedActivity.name)
      const activityHours = activityTypeData ? activityTypeData.value : 0

      // 해당 활동의 시간대 분포 찾기
      const hourlyDistribution = day.hourlyActivity
        .filter((activity) => activity.name === selectedActivity.name)
        .map((activity) => {
          let duration = activity.end - activity.start
          if (activity.end < activity.start) {
            duration = 24 - activity.start + activity.end
          }
          return {
            start: activity.start,
            end: activity.end,
            duration,
          }
        })

      return {
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        isWeekend: day.isWeekend,
        hours: activityHours,
        hourlyDistribution,
      }
    })

    // 주별 데이터 계산
    const weeklyData = mockData.weeklyData.map((week) => {
      // 해당 주의 일별 데이터
      const daysInWeek = dailyData.filter((day) => day.date >= week.startDate && day.date <= week.endDate)

      // 주간 평균 계산
      const totalHours = daysInWeek.reduce((sum, day) => sum + day.hours, 0)
      const avgHours = daysInWeek.length > 0 ? totalHours / daysInWeek.length : 0

      return {
        week: `${week.startDate.split("-")[1]}/${week.startDate.split("-")[2]}~${week.endDate.split("-")[1]}/${week.endDate.split("-")[2]}`,
        startDate: week.startDate,
        endDate: week.endDate,
        avgHours,
        dailyData: daysInWeek,
      }
    })

    // 시간대별 분포 계산
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
      // 해당 시간에 활동이 있는 날짜 수 계산
      let count = 0
      dailyData.forEach((day) => {
        day.hourlyDistribution.forEach((dist) => {
          if (
            dist.start <= hour &&
            (dist.end > hour || (dist.end < dist.start && (hour < dist.end || hour >= dist.start)))
          ) {
            count++
          }
        })
      })

      return {
        hour,
        count,
        percentage: (count / dailyData.length) * 100,
      }
    })

    // 다른 활동과의 상관관계 계산
    const activityTypes = ACTIVITY_TYPES

    const correlations = activityTypes
      .filter((type) => type.name !== selectedActivity.name)
      .map((type) => {
        // 각 날짜별로 두 활동의 시간 추출
        const pairs = mockData.monthData.map((day) => {
          const selectedActivityData = day.activityTypes.find((t) => t.name === selectedActivity.name)
          const otherActivityData = day.activityTypes.find((t) => t.name === type.name)

          return {
            selectedHours: selectedActivityData ? selectedActivityData.value : 0,
            otherHours: otherActivityData ? otherActivityData.value : 0,
          }
        })

        // 평균 계산
        const totalSelectedHours = pairs.reduce((sum, pair) => sum + pair.selectedHours, 0)
        const totalOtherHours = pairs.reduce((sum, pair) => sum + pair.otherHours, 0)
        const avgSelectedHours = totalSelectedHours / pairs.length
        const avgOtherHours = totalOtherHours / pairs.length

        return {
          name: type.name,
          color: type.color,
          avgHours: avgOtherHours,
          correlation: calculateCorrelation(pairs, avgSelectedHours, avgOtherHours),
          data: pairs,
        }
      })

    return {
      dailyData,
      weeklyData,
      timeDistribution,
      correlations,
    }
  }, [selectedActivity])

  return {
    activityData,
  }
}

/**
 * 피어슨 상관계수 계산 함수
 */
function calculateCorrelation(pairs: any[], avgX: number, avgY: number): number {
  let numerator = 0
  let denominatorX = 0
  let denominatorY = 0

  pairs.forEach((pair) => {
    const diffX = pair.selectedHours - avgX
    const diffY = pair.otherHours - avgY
    numerator += diffX * diffY
    denominatorX += diffX * diffX
    denominatorY += diffY * diffY
  })

  if (denominatorX === 0 || denominatorY === 0) return 0
  return numerator / Math.sqrt(denominatorX * denominatorY)
}
