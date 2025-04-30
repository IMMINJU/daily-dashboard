"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivitySelector } from "@/components/activity-analysis/activity-selector"
import { ActivityStats } from "@/components/activity-analysis/activity-stats"
import { TimeDistributionChart } from "@/components/activity-analysis/time-distribution-chart"
import { TrendChart } from "@/components/activity-analysis/trend-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts"
import { useActivityData } from "@/hooks/useActivityData"
import type { ActivityType } from "@/types"
import { ACTIVITY_TYPES } from "@/constants/activity-types"

// 활동 유형 정의
const activityTypes = ACTIVITY_TYPES

export default function ActivityAnalysisPage() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(activityTypes[0])
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly">("daily")

  const { activityData } = useActivityData(selectedActivity)

  // 데이터가 없는 경우만 처리
  if (!activityData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">활동별 상세 분석</h1>
          <p className="text-muted-foreground">각 활동 유형에 대한 상세 분석 및 통계</p>
        </div>
        <ActivitySelector
          activities={activityTypes}
          selectedActivity={selectedActivity}
          onSelectActivity={setSelectedActivity}
        />
      </div>

      <ActivityStats activity={selectedActivity} data={activityData} />

      <Tabs
        defaultValue="daily"
        className="w-full"
        onValueChange={(value) => setTimeFrame(value as "daily" | "weekly")}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">활동 추세</h2>
          <TabsList>
            <TabsTrigger value="daily">일별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>일별 {selectedActivity.name} 시간 추세</CardTitle>
              <CardDescription>최근 30일간의 {selectedActivity.name} 시간 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={activityData.dailyData} activity={selectedActivity} timeFrame="daily" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>주별 {selectedActivity.name} 시간 추세</CardTitle>
              <CardDescription>주간 평균 {selectedActivity.name} 시간 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={activityData.weeklyData} activity={selectedActivity} timeFrame="weekly" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{selectedActivity.name} 시간대별 분포</CardTitle>
          <CardDescription>하루 중 {selectedActivity.name} 활동이 많은 시간대</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeDistributionChart data={activityData.timeDistribution} activity={selectedActivity} />
        </CardContent>
      </Card>

      <WeekdayVsWeekendComparison activityData={activityData} selectedActivity={selectedActivity} />
    </div>
  )
}

interface WeekdayVsWeekendComparisonProps {
  activityData: any
  selectedActivity: ActivityType
}

function WeekdayVsWeekendComparison({ activityData, selectedActivity }: WeekdayVsWeekendComparisonProps) {
  // 평일/주말 데이터 계산
  const weekdayData = activityData.dailyData.filter((day) => !day.isWeekend)
  const weekendData = activityData.dailyData.filter((day) => day.isWeekend)

  // 평균 계산
  const avgWeekdayHours =
    weekdayData.length > 0
      ? (weekdayData.reduce((sum, day) => sum + day.hours, 0) / weekdayData.length).toFixed(1)
      : "0.0"

  const avgWeekendHours =
    weekendData.length > 0
      ? (weekendData.reduce((sum, day) => sum + day.hours, 0) / weekendData.length).toFixed(1)
      : "0.0"

  // 시간대별 분포 계산
  const weekdayDistribution = Array.from({ length: 24 }, (_, hour) => {
    let count = 0
    weekdayData.forEach((day) => {
      day.hourlyDistribution.forEach((dist) => {
        if (
          dist.start <= hour &&
          (dist.end > hour || (dist.end < dist.start && (hour < dist.end || hour >= dist.start)))
        ) {
          count++
        }
      })
    })
    return { hour, count: weekdayData.length > 0 ? (count / weekdayData.length) * 100 : 0 }
  })

  const weekendDistribution = Array.from({ length: 24 }, (_, hour) => {
    let count = 0
    weekendData.forEach((day) => {
      day.hourlyDistribution.forEach((dist) => {
        if (
          dist.start <= hour &&
          (dist.end > hour || (dist.end < dist.start && (hour < dist.end || hour >= dist.start)))
        ) {
          count++
        }
      })
    })
    return { hour, count: weekendData.length > 0 ? (count / weekendData.length) * 100 : 0 }
  })

  // 시간대별 분포 데이터 생성
  const hourlyComparisonData = Array.from({ length: 24 }, (_, hour) => {
    return {
      hour: hour.toString().padStart(2, "0"),
      평일: Number(weekdayDistribution[hour].count.toFixed(1)),
      주말: Number(weekendDistribution[hour].count.toFixed(1)),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>평일 vs 주말 {selectedActivity.name} 패턴</CardTitle>
        <CardDescription>평일과 주말의 {selectedActivity.name} 활동 비교</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <h3 className="mb-4 text-lg font-medium">평균 {selectedActivity.name} 시간</h3>
            <div className="w-full max-w-md">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-sm text-muted-foreground">평일</span>
                  <span className="text-2xl font-bold">{avgWeekdayHours}시간</span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-sm text-muted-foreground">주말</span>
                  <span className="text-2xl font-bold">{avgWeekendHours}시간</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-center">
                  {Number(avgWeekendHours) > Number(avgWeekdayHours)
                    ? `주말에 평일보다 ${(Number(avgWeekendHours) - Number(avgWeekdayHours)).toFixed(1)}시간 더 ${selectedActivity.name} 활동을 합니다.`
                    : Number(avgWeekdayHours) > Number(avgWeekendHours)
                      ? `평일에 주말보다 ${(Number(avgWeekdayHours) - Number(avgWeekendHours)).toFixed(1)}시간 더 ${selectedActivity.name} 활동을 합니다.`
                      : `평일과 주말의 ${selectedActivity.name} 활동 시간이 비슷합니다.`}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium text-center">시간대별 분포 비교</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" />
                  <YAxis label={{ value: "발생 확률 (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${value}%`, ""]} labelFormatter={(label) => `${label}:00`} />
                  <Legend />
                  <Line type="monotone" dataKey="평일" stroke="#8884d8" />
                  <Line type="monotone" dataKey="주말" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
