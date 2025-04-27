import type React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MetricCardProps {
  title: string
  value: string
  progressValue: number
  progressColor: string
  previousValue?: number
  currentValue: number
  calculateChange: (current: number, previous: number) => number | null
  unit: string
}

export function MetricCard({
  title,
  value,
  progressValue,
  progressColor,
  previousValue,
  currentValue,
  calculateChange,
  unit,
}: MetricCardProps) {
  const change = previousValue ? calculateChange(currentValue, previousValue) : null
  const isIncrease = change !== null && change > 0
  const changeDiff = previousValue ? Math.abs(currentValue - previousValue) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-2">
          <Progress
            value={progressValue}
            className="h-2"
            style={
              {
                "--progress-background": progressColor,
              } as React.CSSProperties
            }
            aria-label={`${title} 진행도: ${Math.round(progressValue)}%`}
          />
        </div>
        {previousValue !== undefined && (
          <p className="mt-2 text-xs flex items-center">
            {isIncrease ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" aria-hidden="true" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" aria-hidden="true" />
            )}
            <span>
              전일 대비 {changeDiff}
              {unit}
              {isIncrease ? " 증가" : " 감소"}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
