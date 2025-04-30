"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Calendar, Home, LineChart, Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // 컴포넌트 마운트 시 로컬 스토리지에서 상태 불러오기
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // 상태 변경 시 로컬 스토리지에 저장
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const menuItems = [
    { icon: Home, label: "홈", href: "/" },
    { icon: BarChart3, label: "대시보드", href: "/dashboard" },
    { icon: LineChart, label: "분석", href: "/analytics" },
    { icon: Activity, label: "활동 분석", href: "/activity-analysis" },
    { icon: Calendar, label: "캘린더", href: "/calendar" },
  ]

  // PC 사이드바 (접기/펼치기 가능)
  const desktopSidebar = (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-72",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b px-6 justify-between">
        {!collapsed && <h2 className="text-lg font-semibold">일상 트래커</h2>}
        <Button variant="ghost" size="icon" onClick={toggleCollapsed} className="ml-auto">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <TooltipProvider delayDuration={0}>
          <nav className="grid gap-2 px-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </TooltipProvider>
      </div>
      <div className="border-t p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <Avatar>
            <AvatarImage src="/vibrant-street-market.png" alt="사용자" />
            <AvatarFallback>임민주</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">임민주</span>
              <span className="text-xs text-muted-foreground">minju2996@gmail.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 모바일 하단 내비게이션 바 (아이콘만 표시)
  const mobileNavbar = (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-md p-2 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6" />
            <span className="mt-1 text-xs">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <div className="hidden xl:block">{desktopSidebar}</div>

      {/* 모바일 하단 내비게이션 */}
      <div className="xl:hidden">{mobileNavbar}</div>
    </>
  )
}
