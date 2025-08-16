"use client"

import type React from "react"

import { useRef, useEffect } from "react"

interface GestureHandlerProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onPinch?: (scale: number) => void
  children: React.ReactNode
}

export function MobileGestureHandler({ onSwipeLeft, onSwipeRight, onPinch, children }: GestureHandlerProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const lastPinchDistance = useRef<number>(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      } else if (e.touches.length === 2 && onPinch) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        lastPinchDistance.current = distance
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || e.touches.length > 0) return

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaX = touchEnd.x - touchStart.current.x
      const deltaY = touchEnd.y - touchStart.current.y

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      touchStart.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch && lastPinchDistance.current > 0) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        const scale = distance / lastPinchDistance.current
        onPinch(scale)
        lastPinchDistance.current = distance
      }
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchend", handleTouchEnd, { passive: true })
    element.addEventListener("touchmove", handleTouchMove, { passive: true })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("touchmove", handleTouchMove)
    }
  }, [onSwipeLeft, onSwipeRight, onPinch])

  return <div ref={elementRef}>{children}</div>
}
