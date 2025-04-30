"use client"

import { useState, useEffect } from "react"

/**
 * 화면 크기에 따른 정보를 제공하는 훅
 * @param mobileBreakpoint 모바일로 간주할 최대 너비 (기본값: 768px)
 * @param desktopBreakpoint 데스크탑으로 간주할 최소 너비 (기본값: 1280px)
 * @returns 화면 크기 정보 객체
 */
export function useScreenSize(mobileBreakpoint = 768, desktopBreakpoint = 1280) {
  const [screenInfo, setScreenInfo] = useState({
    isMobile: false,
    isDesktop: false,
    width: 0,
    maxVisibleEvents: 3, // 기본값
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const isMobile = width < mobileBreakpoint
      const isDesktop = width >= desktopBreakpoint

      // 화면 크기에 따라 표시할 이벤트 수 결정
      let maxVisibleEvents = 3 // 태블릿 기본값
      if (isMobile) maxVisibleEvents = 1
      if (isDesktop) maxVisibleEvents = 5

      setScreenInfo({
        isMobile,
        isDesktop,
        width,
        maxVisibleEvents,
      })
    }

    // 초기 체크
    checkScreenSize()

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", checkScreenSize)

    // 클린업 함수
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [mobileBreakpoint, desktopBreakpoint])

  return screenInfo
}

/**
 * 현재 화면이 모바일 크기인지 감지하는 훅 (이전 버전과의 호환성 유지)
 * @param breakpoint 모바일로 간주할 최대 너비 (기본값: 768px)
 * @returns 모바일 여부 (boolean)
 */
export function useMobile(breakpoint = 768): boolean {
  const { isMobile } = useScreenSize(breakpoint)
  return isMobile
}
