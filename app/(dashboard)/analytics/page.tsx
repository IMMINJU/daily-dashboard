"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockData } from "@/lib/mock-data"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { format, parseISO, isWeekend } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart2, PieChartIcon, Clock } from "lucide-react"
import { ACTIVITY_TYPES } from "@/constants/activity-types"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  // 활동 유형 및 색상 정의 - 순서 일관성을 위해 명시적으로 정의
  const activityTypes = ACTIVITY_TYPES

  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (timeRange === "all") return mockData.monthData

    const now = new Date()
    const lastWeekStart = new Date(now)
    lastWeekStart.setDate(now.getDate() - 7)

    return mockData.monthData.filter((day) => {
      const date = parseISO(day.date)
      return date >= lastWeekStart
    })
  }, [timeRange])

  // 활동 유형별 평균 시간 계산
  const activityAverages = useMemo(() => {
    const totals = {}

    filteredData.forEach((day) => {
      day.activityTypes.forEach((type) => {
        if (!totals[type.name]) totals[type.name] = { total: 0, count: 0, color: type.color }
        totals[type.name].total += type.value
        totals[type.name].count++
      })
    })

    // 활동 유형 순서를 일관되게 유지
    return activityTypes.map((type) => ({
      name: type.name,
      value: Math.round((totals[type.name]?.total || 0) / (totals[type.name]?.count || 1)),
      color: type.color,
    }))
  }, [filteredData, activityTypes])

  // 요일별 활동 패턴
  const dayOfWeekPatterns = useMemo(() => {
    const dayPatterns = {
      0: { name: "일", activities: {} },
      1: { name: "월", activities: {} },
      2: { name: "화", activities: {} },
      3: { name: "수", activities: {} },
      4: { name: "목", activities: {} },
      5: { name: "금", activities: {} },
      6: { name: "토", activities: {} },
    }

    const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

    filteredData.forEach((day) => {
      const date = parseISO(day.date)
      const dayOfWeek = date.getDay()
      dayCounts[dayOfWeek]++

      day.activityTypes.forEach((type) => {
        if (!dayPatterns[dayOfWeek].activities[type.name]) {
          dayPatterns[dayOfWeek].activities[type.name] = { total: 0, color: type.color }
        }
        dayPatterns[dayOfWeek].activities[type.name].total += type.value
      })
    })

    // 평균 계산
    Object.keys(dayPatterns).forEach((day) => {
      const activities = dayPatterns[day].activities
      Object.keys(activities).forEach((activity) => {
        activities[activity].average = Math.round(activities[activity].total / (dayCounts[day] || 1))
      })
    })

    // 차트 데이터 형식으로 변환
    return Object.values(dayPatterns).map((day) => {
      const result = { name: day.name }
      activityTypes.forEach((type) => {
        result[type.name] = day.activities[type.name]?.average || 0
      })
      return result
    })
  }, [filteredData, activityTypes])

  // 시간대별 활동 분포 (히트맵 데이터)
  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const distribution = {}

    // 초기화
    hours.forEach((hour) => {
      distribution[hour] = {}
      activityTypes.forEach((type) => {
        distribution[hour][type.name] = 0
      })
    })

    // 데이터 집계
    filteredData.forEach((day) => {
      day.hourlyActivity.forEach((activity) => {
        const start = activity.start
        const end = activity.end

        // 자정을 넘어가는 활동 처리
        if (end < start) {
          // 시작 시간부터 자정까지
          for (let h = start; h < 24; h++) {
            distribution[h][activity.name]++
          }
          // 자정부터 종료 시간까지
          for (let h = 0; h < end; h++) {
            distribution[h][activity.name]++
          }
        } else {
          // 일반적인 경우
          for (let h = start; h < end; h++) {
            distribution[h][activity.name]++
          }
        }
      })
    })

    // 비율 계산
    const totalDays = filteredData.length
    hours.forEach((hour) => {
      activityTypes.forEach((type) => {
        distribution[hour][type.name] = Math.round((distribution[hour][type.name] / totalDays) * 100)
      })
    })

    // 차트 데이터 형식으로 변환
    return hours.map((hour) => {
      const result = { hour: `${hour}:00` }
      activityTypes.forEach((type) => {
        result[type.name] = distribution[hour][type.name]
      })
      return result
    })
  }, [filteredData, activityTypes])

  // 평일 vs 주말 비교 데이터
  const weekdayVsWeekend = useMemo(() => {
    const weekdayData = { count: 0 }
    const weekendData = { count: 0 }

    filteredData.forEach((day) => {
      const date = parseISO(day.date)
      const isWeekendDay = isWeekend(date)

      const targetData = isWeekendDay ? weekendData : weekdayData
      targetData.count++

      day.activityTypes.forEach((type) => {
        if (!targetData[type.name]) {
          targetData[type.name] = { total: 0, color: type.color }
        }
        targetData[type.name].total += type.value
      })
    })

    // 평균 계산
    const calculateAverages = (data) => {
      const result = {}
      activityTypes.forEach((type) => {
        if (data[type.name] && data.count > 0) {
          result[type.name] = Math.round((data[type.name].total / data.count) * 10) / 10 // 소수점 한 자리로 반올림
        } else {
          result[type.name] = 0
        }
      })
      return result
    }

    const weekdayAverages = calculateAverages(weekdayData)
    const weekendAverages = calculateAverages(weekendData)

    // 차트 데이터 형식으로 변환
    return activityTypes.map((type) => {
      return {
        name: type.name,
        평일: weekdayAverages[type.name] || 0,
        주말: weekendAverages[type.name] || 0,
        color: type.color,
      }
    })
  }, [filteredData, activityTypes])

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight xl:text-4xl">활동 분석</h1>
          <p className="text-muted-foreground xl:text-lg">활동 데이터에 대한 심층 분석 및 인사이트</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] xl:w-[220px] xl:text-base">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="xl:text-base">
                전체 기간
              </SelectItem>
              <SelectItem value="week" className="xl:text-base">
                최근 7일
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 데스크탑에서는 탭을 좌측에 수직으로 배치하고 콘텐츠를 우측에 표시 */}
      <div className="xl:grid xl:grid-cols-[240px_1fr] xl:gap-6">
        <div className="hidden xl:block">
          <div className="sticky top-4 space-y-2 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">분석 카테고리</h3>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === "overview" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <PieChartIcon className="h-5 w-5" />
                <span>개요</span>
              </button>
              <button
                onClick={() => setActiveTab("time")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === "time" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <Clock className="h-5 w-5" />
                <span>시간 분석</span>
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === "comparison" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                <span>비교 분석</span>
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === "activities" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <Activity className="h-5 w-5" />
                <span>활동 분석</span>
              </button>
            </div>
          </div>
        </div>

        {/* 모바일/태블릿에서는 기존 탭 인터페이스 유지 */}
        <div className="xl:hidden">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden md:inline">개요</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">시간 분석</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden md:inline">비교 분석</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden md:inline">활동 분석</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 콘텐츠 영역 */}
        <div>
          {/* 개요 탭 */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 분석 기간 카드 */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium lg:text-base">분석 기간</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold lg:text-3xl">{filteredData.length}일</div>
                    <p className="mt-2 text-xs text-muted-foreground lg:text-sm">
                      {filteredData.length > 0
                        ? `${format(parseISO(filteredData[0].date), "yyyy년 MM월 dd일")} ~ 
                        ${format(parseISO(filteredData[filteredData.length - 1].date), "yyyy년 MM월 dd일")}`
                        : "데이터 없음"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 활동 분포 파이 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="lg:text-xl">활동 시간 분포</CardTitle>
                  <CardDescription className="lg:text-base">평균 일일 활동 시간 분배</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] lg:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityAverages}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => {
                          // 0시간인 항목은 라벨 표시하지 않음
                          return value > 0 ? `${name}: ${value}시간` : null
                        }}
                        className="lg:text-base"
                      >
                        {activityAverages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}시간`, name]}
                        isAnimationActive={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            // 0시간인 항목은 툴팁 표시하지 않음
                            if (payload[0].value === 0) return null

                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm lg:p-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground lg:text-base">
                                    <div
                                      className="h-2 w-2 rounded-full lg:h-3 lg:w-3"
                                      style={{ backgroundColor: payload[0].payload.color }}
                                    />
                                    {payload[0].name}:
                                  </div>
                                  <div className="text-right text-sm font-medium lg:text-base">
                                    {payload[0].value}시간
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend className="lg:text-base" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 시간 분석 탭 */}
          {activeTab === "time" && (
            <div className="space-y-6">
              {/* 시간대별 활동 히트맵 */}
              <Card>
                <CardHeader>
                  <CardTitle className="lg:text-xl">시간대별 활동 분포</CardTitle>
                  <CardDescription className="lg:text-base">하루 중 시간대별 활동 발생 확률 (%)</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] lg:h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" className="lg:text-base" />
                      <YAxis dataKey="hour" type="category" width={50} className="lg:text-base" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm lg:p-3">
                                <div className="mb-2 font-medium lg:text-lg">{label}</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {payload.map((entry, index) => {
                                    // 값이 0인 항목은 표시하지 않음
                                    if (entry.value === 0) return null
                                    return (
                                      <React.Fragment key={index}>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground lg:text-base">
                                          <div
                                            className="h-2 w-2 rounded-full lg:h-3 lg:w-3"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          {entry.name}:
                                        </div>
                                        <div className="text-right text-sm font-medium lg:text-base">
                                          {entry.value}%
                                        </div>
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend className="lg:text-base" />
                      {activityTypes.map((type) => (
                        <Bar key={type.name} dataKey={type.name} stackId="a" fill={type.color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 요일별 활동 패턴 */}
              <Card>
                <CardHeader>
                  <CardTitle className="lg:text-xl">요일별 활동 패턴</CardTitle>
                  <CardDescription className="lg:text-base">각 요일별 평균 활동 시간</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] lg:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekPatterns}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" className="lg:text-base" />
                      <YAxis className="lg:text-base" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm lg:p-3">
                                <div className="mb-2 font-medium lg:text-lg">{label}요일</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {payload.map((entry, index) => {
                                    // 값이 0인 항목은 표시하지 않음
                                    if (entry.value === 0) return null
                                    return (
                                      <React.Fragment key={index}>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground lg:text-base">
                                          <div
                                            className="h-2 w-2 rounded-full lg:h-3 lg:w-3"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          {entry.name}:
                                        </div>
                                        <div className="text-right text-sm font-medium lg:text-base">
                                          {entry.value}시간
                                        </div>
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend className="lg:text-base" />
                      {activityTypes.map((type) => (
                        <Bar key={type.name} dataKey={type.name} fill={type.color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 비교 분석 탭 */}
          {activeTab === "comparison" && (
            <div className="space-y-6">
              {/* 평일 vs 주말 비교 */}
              <Card>
                <CardHeader>
                  <CardTitle className="lg:text-xl">평일 vs 주말 비교</CardTitle>
                  <CardDescription className="lg:text-base">평일과 주말의 활동 패턴 비교</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] lg:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayVsWeekend} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" className="lg:text-base" />
                      <YAxis dataKey="name" type="category" width={80} className="lg:text-base" />
                      <Tooltip
                        formatter={(value) => [`${value}시간`, ""]}
                        labelFormatter={(label) => `${label}`}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            // 모든 값이 0인 경우 툴팁 표시하지 않음
                            const hasNonZeroValue = payload.some((entry) => entry.value !== 0)
                            if (!hasNonZeroValue) return null

                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm lg:p-3">
                                <div className="mb-2 font-medium lg:text-lg">{label}</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {payload.map((entry, index) => {
                                    // 값이 0인 항목은 표시하지 않음
                                    if (entry.value === 0) return null
                                    return (
                                      <React.Fragment key={index}>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground lg:text-base">
                                          <div
                                            className="h-2 w-2 rounded-full lg:h-3 lg:w-3"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          {entry.name}:
                                        </div>
                                        <div className="text-right font-medium lg:text-base">{entry.value}시간</div>
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend className="lg:text-base" />
                      <Bar dataKey="평일" fill="#8884d8" />
                      <Bar dataKey="주말" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 활동 분석 탭 */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              {/* 활동별 시간 분포 */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activityAverages.map((activity, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full lg:h-4 lg:w-4"
                          style={{ backgroundColor: activity.color }}
                        />
                        <CardTitle className="text-sm font-medium lg:text-base">{activity.name} 분석</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold lg:text-3xl">{activity.value}시간/일</div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs lg:text-sm">
                          <span>0시간</span>
                          <span>12시간</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-secondary lg:h-3">
                          <div
                            className="h-2 rounded-full lg:h-3"
                            style={{
                              width: `${Math.min(100, (activity.value / 12) * 100)}%`,
                              backgroundColor: activity.color,
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm lg:text-base">
                        <div className="text-muted-foreground">비율:</div>
                        <div className="text-right font-medium">{Math.round((activity.value / 24) * 100)}% / 일</div>
                        <div className="text-muted-foreground">주간 총계:</div>
                        <div className="text-right font-medium">{activity.value * 7}시간 / 주</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
