"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Calendar, Home, LineChart, Activity } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: "홈", href: "/" },
    { icon: BarChart3, label: "대시보드", href: "/dashboard" },
    { icon: LineChart, label: "분석", href: "/analytics" },
    { icon: Activity, label: "활동 분석", href: "/activity-analysis" },
    { icon: Calendar, label: "캘린더", href: "/calendar" },
  ]

  // PC 사이드바 (항상 펼친 상태)
  const desktopSidebar = (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">일상 트래커</h2>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
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
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/vibrant-street-market.png" alt="사용자" />
            <AvatarFallback>임민주</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">임민주</span>
            <span className="text-xs text-muted-foreground">minju2996@gmail.com</span>
          </div>
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
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block">{desktopSidebar}</div>

      {/* 모바일 하단 내비게이션 */}
      <div className="lg:hidden">{mobileNavbar}</div>
    </>
  )
}
