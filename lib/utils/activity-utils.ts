// 활동 관련 유틸리티 함수들

/**
 * 날짜 문자열에서 요일 및 주말 여부 계산 함수
 */
export const getDayInfo = (dateStr: string) => {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  return { dayOfWeek, isWeekend }
}

/**
 * hourlyActivity에서 수면 시간 계산 함수
 */
export const calculateSleepHours = (hourlyActivities: { name: string; start: number; end: number }[]) => {
  const sleepActivities = hourlyActivities.filter((activity) => activity.name === "수면")
  let totalSleepHours = 0

  sleepActivities.forEach((activity) => {
    let duration = activity.end - activity.start

    // 자정을 넘어가는 수면 처리 (예: 22시-6시 수면)
    if (activity.end < activity.start) {
      duration = 24 - activity.start + activity.end
    }

    totalSleepHours += duration
  })

  // 정수로 반환
  return Math.round(totalSleepHours)
}

/**
 * hourlyActivity에서 외출 시간 계산 함수
 */
export const calculateOutdoorMinutes = (hourlyActivities: { name: string; start: number; end: number }[]) => {
  const outdoorActivities = hourlyActivities.filter((activity) => activity.name === "외출")
  let totalOutdoorMinutes = 0

  outdoorActivities.forEach((activity) => {
    let duration = activity.end - activity.start

    // 자정을 넘어가는 활동 처리
    if (activity.end < activity.start) {
      duration = 24 - activity.start + activity.end
    }

    // 시간을 분으로 변환
    totalOutdoorMinutes += duration * 60
  })

  return Math.round(totalOutdoorMinutes)
}

/**
 * hourlyActivity에서 activityTypesValues 계산 함수
 */
export const calculateActivityValues = (
  hourlyActivities: { name: string; start: number; end: number }[],
  activityTypeTemplate: { name: string; color: string }[],
) => {
  // 각 활동 유형별 시간 초기화
  const activityValues: Record<string, number> = {}

  // 활동 유형 템플릿의 모든 이름으로 초기화
  activityTypeTemplate.forEach((type) => {
    activityValues[type.name] = 0
  })

  // 각 활동의 시간 계산
  hourlyActivities.forEach((activity) => {
    let duration = activity.end - activity.start

    // 자정을 넘어가는 활동 처리 (예: 22시-6시 수면)
    if (activity.end < activity.start) {
      duration = 24 - activity.start + activity.end
    }

    activityValues[activity.name] += duration
  })

  // 총 시간 계산
  const totalHours = Object.values(activityValues).reduce((sum, val) => sum + val, 0)

  // 총 시간이 24시간이 아닌 경우 조정
  if (Math.abs(totalHours - 24) > 0.1) {
    // 부족한 시간은 여가에 추가
    if (totalHours < 24) {
      activityValues.여가 += 24 - totalHours
    }
    // 초과 시간은 비례적으로 감소
    else if (totalHours > 24) {
      const ratio = 24 / totalHours
      Object.keys(activityValues).forEach((key) => {
        activityValues[key] *= ratio
      })
    }
  }

  // 활동 유형 템플릿 순서대로 값 반환 (정수로 변환)
  return activityTypeTemplate.map((template) => Math.round(activityValues[template.name]))
}

/**
 * 커스텀 activityTypes 생성 함수
 */
export const createActivityTypes = (values: number[], activityTypeTemplate: { name: string; color: string }[]) => {
  if (!values || values.length !== activityTypeTemplate.length) {
    throw new Error("모든 activityTypes 항목에 대한 value가 제공되어야 합니다.")
  }

  // 값의 합이 24시간인지 확인
  const sum = values.reduce((acc, val) => acc + val, 0)
  if (Math.abs(sum - 24) > 0.1) {
    // 부동소수점 오차 허용
    console.warn(`activityTypesValues의 합은 24시간이어야 합니다. 현재: ${sum}`)

    // 값 조정
    const adjustedValues = [...values]
    const ratio = 24 / sum
    for (let i = 0; i < adjustedValues.length; i++) {
      adjustedValues[i] = Math.round(adjustedValues[i] * ratio)
    }

    return activityTypeTemplate.map((template, index) => ({
      ...template,
      value: adjustedValues[index],
    }))
  }

  return activityTypeTemplate.map((template, index) => ({
    ...template,
    value: values[index],
  }))
}

/**
 * 활동 시간이 겹치는 문제 해결을 위해 각 날짜의 활동 정리
 */
export const normalizeHourlyActivities = (
  customData: Record<string, { hourlyActivity: { name: string; start: number; end: number }[] }>,
) => {
  Object.keys(customData).forEach((date) => {
    // 24시를 0시로 변환
    customData[date].hourlyActivity.forEach((activity) => {
      if (activity.start === 24) activity.start = 0
      if (activity.end === 24) activity.end = 0
    })
  })

  return customData
}
