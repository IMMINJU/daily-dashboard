// 공통 타입 정의

export type ActivityType = {
  name: string
  color: string
  value?: number
}

export type HourlyActivity = {
  name: string
  start: number
  end: number
}

export type DayStats = {
  sleepHours: number
  outdoorMinutes: number
}

export type DayData = {
  date: string
  dayOfWeek: number
  isWeekend: boolean
  stats: DayStats
  hourlyActivity: HourlyActivity[]
  activityTypes: ActivityType[]
}

export type WeekDailyData = {
  day: string
  date: string
  sleep: number
  activity: number
}

export type WeekData = {
  startDate: string
  endDate: string
  avgSleepHours: number
  avgOutdoorMinutes: number
  dailyData: WeekDailyData[]
}

export type MockDataType = {
  stats: DayStats
  hourlyActivity: HourlyActivity[]
  activityTypes: ActivityType[]
  weeklyComparison: WeekDailyData[]
  monthData: DayData[]
  weeklyData: WeekData[]
  monthlySummary: {
    totalDays: number
    avgSleepHours: number
    avgOutdoorMinutes: number
  }
  currentDate: string
}

export type TimeDistributionData = {
  hour: number
  count: number
  percentage: number
}

export type ActivityData = {
  dailyData: {
    date: string
    dayOfWeek: number
    isWeekend: boolean
    hours: number
    hourlyDistribution: {
      start: number
      end: number
      duration: number
    }[]
  }[]
  weeklyData: {
    week: string
    startDate: string
    endDate: string
    avgHours: number
    dailyData: any[]
  }[]
  timeDistribution: TimeDistributionData[]
  correlations: {
    name: string
    color: string
    avgHours: number
    correlation: number
    data: any[]
  }[]
}
