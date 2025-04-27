"use client"

import { useState, useEffect } from "react"

/**
 * 현재 화면이 모바일 크기인지 감지하는 훅
 * @param breakpoint 모바일로 간주할 최대 너비 (기본값: 768px)
 * @returns 모바일 여부 (boolean)
 */
export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // 초기 체크
    checkMobile()

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", checkMobile)

    // 클린업 함수
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [breakpoint])

  return isMobile
}
