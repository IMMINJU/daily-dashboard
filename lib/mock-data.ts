import {
  getDayInfo,
  calculateSleepHours,
  calculateOutdoorMinutes,
  calculateActivityValues,
  createActivityTypes,
  normalizeHourlyActivities,
} from "@/lib/utils/activity-utils";
import { ACTIVITY_TYPES } from "@/constants/activity-types";

// 현재 날짜 기준
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// 공통으로 사용할 activityTypes 구조 정의 (이름과 색상만)
const activityTypeTemplate = ACTIVITY_TYPES;

// 모든 날짜에 대한 필수 커스텀 데이터
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
  "2025-04-28": {
    hourlyActivity: [
      { name: "수면", start: 4, end: 8 },
      { name: "외출", start: 8, end: 12 },
      { name: "여가", start: 12, end: 15 },
      { name: "외출", start: 15, end: 16 },
      { name: "여가", start: 16, end: 18 },
      { name: "외출", start: 18, end: 19 },
      { name: "여가", start: 19, end: 1 },
    ],
  },
  "2025-04-29": {
    hourlyActivity: [
      { name: "수면", start: 1, end: 8 },
      { name: "외출", start: 8, end: 12 },
      { name: "여가", start: 12, end: 15 },
      { name: "코딩", start: 15, end: 16 },
      { name: "여가", start: 16, end: 21 },
      { name: "네트워킹", start: 21, end: 22 },
      { name: "여가", start: 22, end: 1 },
    ],
  },
  "2025-04-30": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 11 },
      { name: "여가", start: 11, end: 13 },
      { name: "코딩", start: 13, end: 20 },
      { name: "외출", start: 20, end: 0 },
      { name: "코딩", start: 0, end: 2 },
    ],
  },
  "2025-05-01": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 11 },
      { name: "여가", start: 11, end: 13 },
      { name: "코딩", start: 13, end: 19 },
      { name: "여가", start: 19, end: 20 },
      { name: "코딩", start: 20, end: 2 },
    ],
  },
  "2025-05-02": {
    hourlyActivity: [
      { name: "여가", start: 2, end: 4 },
      { name: "수면", start: 4, end: 11 },
      { name: "여가", start: 11, end: 13 },
      { name: "코딩", start: 13, end: 18 },
      { name: "여가", start: 18, end: 2 },
    ],
  },
  "2025-05-03": {
    hourlyActivity: [
      { name: "여가", start: 2, end: 4 },
      { name: "수면", start: 4, end: 12 },
      { name: "여가", start: 12, end: 14 },
      { name: "코딩", start: 14, end: 18 },
      { name: "여가", start: 18, end: 2 },
    ],
  },
  "2025-05-04": {
    hourlyActivity: [
      { name: "여가", start: 2, end: 4 },
      { name: "수면", start: 4, end: 10 },
      { name: "외출", start: 10, end: 18 },
      { name: "코딩", start: 18, end: 21 },
      { name: "여가", start: 21, end: 2 },
    ],
  },
  "2025-05-05": {
    hourlyActivity: [
      { name: "여가", start: 2, end: 3 },
      { name: "수면", start: 3, end: 10 },
      { name: "외출", start: 10, end: 11 },
      { name: "수면", start: 11, end: 12 },
      { name: "여가", start: 12, end: 15 },
      { name: "코딩", start: 15, end: 20 },
      { name: "여가", start: 20, end: 21 },
      { name: "외출", start: 21, end: 22 },
      { name: "여가", start: 22, end: 1 },
      { name: "수면", start: 1, end: 2 },
    ],
  },
  "2025-05-06": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 10 },
      { name: "코딩", start: 10, end: 15 },
      { name: "여가", start: 15, end: 1 },
      { name: "수면", start: 1, end: 2 },
    ],
  },
  "2025-05-07": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 9 },
      { name: "외출", start: 9, end: 12 },
      { name: "여가", start: 12, end: 15 },
      { name: "외출", start: 15, end: 16 },
      { name: "여가", start: 16, end: 2 },
    ],
  },
  "2025-05-08": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 11 },
      { name: "여가", start: 11, end: 14 },
      { name: "외출", start: 14, end: 17 },
      { name: "여가", start: 17, end: 0 },
      { name: "수면", start: 0, end: 2 },
    ],
  },
  "2025-05-09": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 10 },
      { name: "여가", start: 10, end: 2 },
    ],
  },
  "2025-05-10": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 12 },
      { name: "코딩", start: 12, end: 18 },
      { name: "여가", start: 18, end: 2 },
    ],
  },
  "2025-05-11": {
    hourlyActivity: [
      { name: "수면", start: 2, end: 10 },
      { name: "여가", start: 10, end: 20 },
      { name: "코딩", start: 20, end: 2 },
    ],
  },
};

// 활동 시간 정규화
customData = normalizeHourlyActivities(customData);

// customData에서 날짜 추출 및 정렬
const dates = Object.keys(customData).sort((a, b) => {
  return new Date(a).getTime() - new Date(b).getTime();
});

// 날짜 데이터 생성
const monthData = dates.map((date) => {
  const { dayOfWeek, isWeekend } = getDayInfo(date);
  const custom = customData[date];

  if (!custom) {
    throw new Error(`날짜 ${date}에 대한 커스텀 데이터가 없습니다.`);
  }

  if (!custom.hourlyActivity) {
    throw new Error(`날짜 ${date}에 대한 hourlyActivity가 없습니다.`);
  }

  // hourlyActivity에서 수면 시간 계산
  const sleepHours = calculateSleepHours(custom.hourlyActivity);

  // hourlyActivity에서 외출 시간 계산
  const outdoorMinutes = calculateOutdoorMinutes(custom.hourlyActivity);

  // hourlyActivity에서 activityTypesValues 계산
  const activityTypesValues = calculateActivityValues(
    custom.hourlyActivity,
    activityTypeTemplate
  );

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
    activityTypes: createActivityTypes(
      activityTypesValues,
      activityTypeTemplate
    ),
  };
});

// 주간 데이터 생성 - 모든 날짜를 포함하도록 수정
const weeklyData = [
  {
    startDate: monthData[0].date,
    endDate: monthData[monthData.length - 1].date,
    avgSleepHours:
      monthData.reduce((sum, day) => sum + day.stats.sleepHours, 0) /
      monthData.length,
    avgOutdoorMinutes:
      monthData.reduce((sum, day) => sum + day.stats.outdoorMinutes, 0) /
      monthData.length,
    dailyData: monthData.map((day) => ({
      day: ["일", "월", "화", "수", "목", "금", "토"][day.dayOfWeek],
      date: day.date,
      sleep: day.stats.sleepHours,
      activity: day.stats.outdoorMinutes,
    })),
  },
];

// 월간 요약 데이터 - 모든 날짜 기반으로 계산
const monthlySummary = {
  totalDays: monthData.length,
  avgSleepHours:
    monthData.reduce((sum, day) => sum + day.stats.sleepHours, 0) /
    monthData.length,
  avgOutdoorMinutes:
    monthData.reduce((sum, day) => sum + day.stats.outdoorMinutes, 0) /
    monthData.length,
};

// 현재 날짜의 데이터 (가장 최근 날짜 사용)
const todayData = monthData[monthData.length - 1];

// 주간 비교 데이터
const weeklyComparison = weeklyData[0].dailyData;

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
};
