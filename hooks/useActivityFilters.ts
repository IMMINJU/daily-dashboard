"use client"

import { useState } from "react"
import type { ActivityType } from "@/types"

/**
 * 활동 필터를 관리하는 커스텀 훅
 */
export function useActivityFilters(activityTypes: ActivityType[]) {
  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // 활동 필터 토글 함수
  const toggleActivityFilter = (activityName: string) => {
    if (activityFilters.includes(activityName)) {
      setActivityFilters(activityFilters.filter((name) => name !== activityName))
    } else {
      setActivityFilters([...activityFilters, activityName])
    }
  }

  // 필터 초기화 함수
  const resetFilters = () => {
    setActivityFilters([])
  }

  return {
    activityFilters,
    showFilters,
    setShowFilters,
    toggleActivityFilter,
    resetFilters,
  }
}
