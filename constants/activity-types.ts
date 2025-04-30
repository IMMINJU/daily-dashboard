import type { ActivityType } from "@/types"

/**
 * 애플리케이션 전체에서 사용되는 활동 유형 정의
 * 활동 이름과 색상 코드를 포함합니다.
 */
export const ACTIVITY_TYPES: ActivityType[] = [
  { name: "수면", color: "#8884d8" },
  { name: "일", color: "#4CAF50" },
  { name: "여가", color: "#a4de6c" },
  { name: "코딩", color: "#ffc658" },
  { name: "네트워킹", color: "#ff8042" },
  { name: "외출", color: "#03A9F4" },
]

/**
 * 캘린더에서 사용되는 활동 유형 (수면과 여가 제외)
 */
export const CALENDAR_ACTIVITY_TYPES: ActivityType[] = ACTIVITY_TYPES.filter(
  (type) => type.name !== "수면" && type.name !== "여가",
)

/**
 * 활동 유형 이름으로 색상을 찾는 유틸리티 함수
 */
export function getActivityColor(activityName: string): string {
  const activity = ACTIVITY_TYPES.find((type) => type.name === activityName)
  return activity?.color || "#666666" // 기본 색상
}

/**
 * 활동 관련 상수 값
 */
export const ACTIVITY_CONSTANTS = {
  OPTIMAL_SLEEP_HOURS: 8,
  OPTIMAL_OUTDOOR_MINUTES: 120,
}
