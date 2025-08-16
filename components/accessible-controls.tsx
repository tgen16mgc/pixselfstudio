"use client"

import type React from "react"

import { useRef, useEffect } from "react"

interface AccessibleControlsProps {
  children: React.ReactNode
  onKeyboardNavigation?: (direction: "up" | "down" | "left" | "right") => void
  ariaLabel?: string
  role?: string
}

export function AccessibleControls({
  children,
  onKeyboardNavigation,
  ariaLabel,
  role = "application",
}: AccessibleControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onKeyboardNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default only for navigation keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()

        switch (e.key) {
          case "ArrowUp":
            onKeyboardNavigation("up")
            break
          case "ArrowDown":
            onKeyboardNavigation("down")
            break
          case "ArrowLeft":
            onKeyboardNavigation("left")
            break
          case "ArrowRight":
            onKeyboardNavigation("right")
            break
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [onKeyboardNavigation])

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      tabIndex={0}
      className="focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
    >
      {children}
    </div>
  )
}
