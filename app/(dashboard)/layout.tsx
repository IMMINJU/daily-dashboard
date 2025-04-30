"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-4 pb-24 md:p-8 xl:p-10 xl:p-12 xl:pb-10">
        <div className="mx-auto max-w-full 2xl:max-w-screen-2xl">{children}</div>
      </main>
    </div>
  )
}
