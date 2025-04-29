import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay } from "date-fns"
import type { Locale } from "date-fns"

/**
 * 캘린더 그리드에 표시할 날짜 배열을 생성합니다.
 * 현재 월의 날짜와 이전/다음 월의 일부 날짜를 포함합니다.
 */
export function generateCalendarDays(currentDate: Date) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 주간 보기 날짜 계산
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // 캘린더 그리드에 표시할 날짜 배열 (이전 달, 현재 달, 다음 달 포함)
  const startDay = monthStart.getDay() // 0: 일요일, 1: 월요일, ...
  const endDay = monthEnd.getDay()

  // 이전 달의 마지막 몇 일
  const prevMonthDays = []
  if (startDay > 0) {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const prevMonthEnd = endOfMonth(prevMonth)

    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd)
      day.setDate(prevMonthEnd.getDate() - i)
      prevMonthDays.push(day)
    }
  }

  // 다음 달의 첫 몇 일
  const nextMonthDays = []
  if (endDay < 6) {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)

    for (let i = 1; i <= 6 - endDay; i++) {
      const day = new Date(nextMonthStart)
      day.setDate(nextMonthStart.getDate() + i - 1)
      nextMonthDays.push(day)
    }
  }

  // 전체 캘린더 그리드 날짜
  return [...prevMonthDays, ...monthDays, ...nextMonthDays]
}

/**
 * 활동 강도에 따른 배경색 클래스를 반환합니다.
 */
export function getActivityIntensityClass(outdoorMinutes: number): string {
  if (outdoorMinutes > 120) return "bg-green-100"
  if (outdoorMinutes > 60) return "bg-green-50"
  if (outdoorMinutes < 30) return "bg-red-50"
  return ""
}

/**
 * 날짜가 오늘인지 확인합니다.
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * 월 제목을 포맷팅합니다.
 */
export function formatMonthTitle(date: Date, locale: Locale): string {
  return format(date, "yyyy년 MM월", { locale })
}
