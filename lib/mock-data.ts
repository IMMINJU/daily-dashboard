import {
  getDayInfo,
  calculateSleepHours,
  calculateOutdoorMinutes,
  calculateActivityValues,
  createActivityTypes,
  normalizeHourlyActivities,
} from "@/lib/utils/activity-utils"

// 현재 날짜 기준
const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

// 공통으로 사용할 activityTypes 구조 정의 (이름과 색상만)
const activityTypeTemplate = [
  { name: "수면", color: "#8884d8" },
  { name: "일", color: "#4CAF50" }, // 초록색으로 변경
  { name: "여가", color: "#a4de6c" },
  { name: "코딩", color: "#ffc658" },
  { name: "네트워킹", color: "#ff8042" },
  { name: "운동", color: "#E91E63" }, // 분홍색으로 변경
  { name: "외출", color: "#03A9F4" }, // 밝은 파란색으로 변경
]

// 모든 날짜에 대한 필수 커스텀 데이터 (4월 27일만 남김)
let customData = {
  "2025-04-27": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 12 },
      { name: "여가", start: 12, end: 16 },
      { name: "외출", start: 16, end: 20 },
      { name: "여가", start: 20, end: 23 },
      { name: "코딩", start: 23, end: 4 },
    ],
  },
}

// 활동 시간 정규화
customData = normalizeHourlyActivities(customData)

// customData에서 날짜 추출 및 정렬
const dates = Object.keys(customData).sort((a, b) => {
  return new Date(a).getTime() - new Date(b).getTime()
})

// 날짜 데이터 생성
const monthData = dates.map((date) => {
  const { dayOfWeek, isWeekend } = getDayInfo(date)
  const custom = customData[date]

  if (!custom) {
    throw new Error(`날짜 ${date}에 대한 커스텀 데이터가 없습니다.`)
  }

  if (!custom.hourlyActivity) {
    throw new Error(`날짜 ${date}에 대한 hourlyActivity가 없습니다.`)
  }

  // hourlyActivity에서 수면 시간 계산
  const sleepHours = calculateSleepHours(custom.hourlyActivity)

  // hourlyActivity에서 외출 시간 계산
  const outdoorMinutes = calculateOutdoorMinutes(custom.hourlyActivity)

  // hourlyActivity에서 activityTypesValues 계산
  const activityTypesValues = calculateActivityValues(custom.hourlyActivity, activityTypeTemplate)

  // 데이터 생성
  return {
    date,
    dayOfWeek,
    isWeekend,
    stats: {
      sleepHours,
      outdoorMinutes,
    },
    hourlyActivity: custom.hourlyActivity,
    activityTypes: createActivityTypes(activityTypesValues, activityTypeTemplate),
  }
})

// 주간 데이터 생성 (단일 날짜이므로 간소화)
const weeklyData = [
  {
    startDate: monthData[0].date,
    endDate: monthData[0].date,
    avgSleepHours: monthData[0].stats.sleepHours,
    avgOutdoorMinutes: monthData[0].stats.outdoorMinutes,
    dailyData: [
      {
        day: ["일", "월", "화", "수", "목", "금", "토"][monthData[0].dayOfWeek],
        date: monthData[0].date,
        sleep: monthData[0].stats.sleepHours,
        activity: monthData[0].stats.outdoorMinutes,
      },
    ],
  },
]

// 월간 요약 데이터 (단일 날짜이므로 간소화)
const monthlySummary = {
  totalDays: 1,
  avgSleepHours: monthData[0].stats.sleepHours,
  avgOutdoorMinutes: monthData[0].stats.outdoorMinutes,
}

// 현재 날짜의 데이터 (단일 날짜이므로 첫 번째 항목 사용)
const todayData = monthData[0]

// 주간 비교 데이터 (단일 날짜이므로 간소화)
const weeklyComparison = weeklyData[0].dailyData

export const mockData = {
  // 오늘 데이터 (기본 표시용)
  stats: todayData.stats,
  hourlyActivity: todayData.hourlyActivity,
  activityTypes: todayData.activityTypes,
  weeklyComparison,

  // 전체 데이터
  monthData,
  weeklyData,
  monthlySummary,

  // 현재 날짜 정보
  currentDate: todayData.date,
}
