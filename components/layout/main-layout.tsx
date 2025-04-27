import type { ReactNode } from "react"

import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-4 pb-24 md:p-8 lg:pb-8">{children}</main>
    </div>
  )
}
