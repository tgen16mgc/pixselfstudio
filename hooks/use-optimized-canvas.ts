"use client"

import { useRef, useEffect, useCallback } from "react"

interface UseOptimizedCanvasProps {
  selections: any
  scale: number
  zoom: number
  drawFunction: (canvas: HTMLCanvasElement, selections: any, scale: number) => void
}

export function useOptimizedCanvas({ selections, scale, zoom, drawFunction }: UseOptimizedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastDrawTime = useRef<number>(0)
  const isDirty = useRef<boolean>(true)
  const lastSelections = useRef<string>("")

  const draw = useCallback(() => {
    if (!canvasRef.current || !isDirty.current) return

    const now = performance.now()
    if (now - lastDrawTime.current < 16) return // Limit to ~60fps

    drawFunction(canvasRef.current, selections, scale * zoom)
    isDirty.current = false
    lastDrawTime.current = now
  }, [selections, scale, zoom, drawFunction])

  useEffect(() => {
    const selectionsString = JSON.stringify(selections)
    if (selectionsString !== lastSelections.current) {
      isDirty.current = true
      lastSelections.current = selectionsString
    }
  }, [selections])

  useEffect(() => {
    const animate = () => {
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  return canvasRef
}
