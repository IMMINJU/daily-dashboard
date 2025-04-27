"use client"

import React, { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

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

    return Object.keys(totals).map((name) => ({
      name,
      value: Math.round(totals[name].total / totals[name].count),
      color: totals[name].color,
    }))
  }, [filteredData])

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
      Object.keys(day.activities).forEach((activity) => {
        result[activity] = day.activities[activity].average
      })
      return result
    })
  }, [filteredData])

  // 시간대별 활동 분포 (히트맵 데이터)
  const hourlyDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const activityTypes = ["수면", "일", "여가", "코딩", "네트워킹", "운동", "외출"]
    const distribution = {}

    // 초기화
    hours.forEach((hour) => {
      distribution[hour] = {}
      activityTypes.forEach((type) => {
        distribution[hour][type] = 0
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
        distribution[hour][type] = Math.round((distribution[hour][type] / totalDays) * 100)
      })
    })

    // 차트 데이터 형식으로 변환
    return hours.map((hour) => {
      const result = { hour: `${hour}:00` }
      activityTypes.forEach((type) => {
        result[type] = distribution[hour][type]
      })
      return result
    })
  }, [filteredData])

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
      Object.keys(data).forEach((key) => {
        if (key !== "count" && data.count > 0) {
          result[key] = Math.round((data[key].total / data.count) * 10) / 10 // 소수점 한 자리로 반올림
        }
      })
      return result
    }

    const weekdayAverages = calculateAverages(weekdayData)
    const weekendAverages = calculateAverages(weekendData)

    // 차트 데이터 형식으로 변환
    return Object.keys({ ...weekdayAverages, ...weekendAverages }).map((activity) => {
      return {
        name: activity,
        평일: weekdayAverages[activity] || 0,
        주말: weekendAverages[activity] || 0,
      }
    })
  }, [filteredData])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">활동 분석</h1>
            <p className="text-muted-foreground">활동 데이터에 대한 심층 분석 및 인사이트</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="week">최근 7일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 분석 기간 카드 */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">분석 기간</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredData.length}일</div>
                  <p className="mt-2 text-xs text-muted-foreground">
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
                <CardTitle>활동 시간 분포</CardTitle>
                <CardDescription>평균 일일 활동 시간 분배</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
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
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: payload[0].payload.color }}
                                  />
                                  {payload[0].name}:
                                </div>
                                <div className="text-right text-sm font-medium">{payload[0].value}시간</div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시간 분석 탭 */}
          <TabsContent value="time" className="space-y-6">
            {/* 시간대별 활동 히트맵 */}
            <Card>
              <CardHeader>
                <CardTitle>시간대별 활동 분포</CardTitle>
                <CardDescription>하루 중 시간대별 활동 발생 확률 (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="hour" type="category" width={50} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="mb-2 font-medium">{label}</div>
                              <div className="grid grid-cols-2 gap-2">
                                {payload.map((entry, index) => {
                                  // 값이 0인 항목은 표시하지 않음
                                  if (entry.value === 0) return null
                                  return (
                                    <React.Fragment key={index}>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        {entry.name}:
                                      </div>
                                      <div className="text-right text-sm font-medium">{entry.value}%</div>
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
                    <Legend />
                    <Bar dataKey="수면" stackId="a" fill="#8884d8" />
                    <Bar dataKey="일" stackId="a" fill="#4CAF50" />
                    <Bar dataKey="여가" stackId="a" fill="#a4de6c" />
                    <Bar dataKey="코딩" stackId="a" fill="#ffc658" />
                    <Bar dataKey="네트워킹" stackId="a" fill="#ff8042" />
                    <Bar dataKey="운동" stackId="a" fill="#E91E63" />
                    <Bar dataKey="외출" stackId="a" fill="#03A9F4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 요일별 활동 패턴 */}
            <Card>
              <CardHeader>
                <CardTitle>요일별 활동 패턴</CardTitle>
                <CardDescription>각 요일별 평균 활동 시간</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekPatterns}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="mb-2 font-medium">{label}요일</div>
                              <div className="grid grid-cols-2 gap-2">
                                {payload.map((entry, index) => {
                                  // 값이 0인 항목은 표시하지 않음
                                  if (entry.value === 0) return null
                                  return (
                                    <React.Fragment key={index}>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        {entry.name}:
                                      </div>
                                      <div className="text-right text-sm font-medium">{entry.value}시간</div>
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
                    <Legend />
                    <Bar dataKey="수면" fill="#8884d8" />
                    <Bar dataKey="일" fill="#4CAF50" />
                    <Bar dataKey="여가" fill="#a4de6c" />
                    <Bar dataKey="코딩" fill="#ffc658" />
                    <Bar dataKey="네트워킹" fill="#ff8042" />
                    <Bar dataKey="운동" fill="#E91E63" />
                    <Bar dataKey="외출" fill="#03A9F4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 비교 분석 탭 */}
          <TabsContent value="comparison" className="space-y-6">
            {/* 평일 vs 주말 비교 */}
            <Card>
              <CardHeader>
                <CardTitle>평일 vs 주말 비교</CardTitle>
                <CardDescription>평일과 주말의 활동 패턴 비교</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayVsWeekend} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      formatter={(value) => [`${value}시간`, ""]}
                      labelFormatter={(label) => `${label}`}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          // 모든 값이 0인 경우 툴팁 표시하지 않음
                          const hasNonZeroValue = payload.some((entry) => entry.value !== 0)
                          if (!hasNonZeroValue) return null

                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="mb-2 font-medium">{label}</div>
                              <div className="grid grid-cols-2 gap-2">
                                {payload.map((entry, index) => {
                                  // 값이 0인 항목은 표시하지 않음
                                  if (entry.value === 0) return null
                                  return (
                                    <React.Fragment key={index}>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        {entry.name}:
                                      </div>
                                      <div className="text-right text-sm font-medium">{entry.value}시간</div>
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
                    <Legend />
                    <Bar dataKey="평일" fill="#8884d8" />
                    <Bar dataKey="주말" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 활동 분석 탭 */}
          <TabsContent value="activities" className="space-y-6">
            {/* 활동별 시간 분포 */}
            <div className="grid gap-4 md:grid-cols-2">
              {activityAverages.map((activity, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activity.color }} />
                      <CardTitle className="text-sm font-medium">{activity.name} 분석</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activity.value}시간/일</div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>0시간</span>
                        <span>12시간</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (activity.value / 12) * 100)}%`,
                            backgroundColor: activity.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">비율:</div>
                      <div className="text-right font-medium">{Math.round((activity.value / 24) * 100)}% / 일</div>
                      <div className="text-muted-foreground">주간 총계:</div>
                      <div className="text-right font-medium">{activity.value * 7}시간 / 주</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
