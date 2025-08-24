"use client"

import { useRef, useEffect, useState } from "react"
import { Eye, EyeOff, Maximize2, Minimize2, RotateCcw, RotateCw } from "lucide-react"
import { RETRO_UI_THEME } from "@/config/8bit-theme"
import { EnhancedRetroPixelPanel, RetroLoadingSpinner } from "./enhanced-8bit-ui"

interface EnhancedCharacterPreviewProps {
  selections: Record<string, { variant: number; color: number }>
  activePart: string
  zoom: number
  onZoomChange: (zoom: number) => void
  isFullscreen: boolean
  onFullscreenToggle: () => void
  showPartHighlight?: boolean
  onTogglePartHighlight?: () => void
  isLoading?: boolean
}

export function EnhancedCharacterPreview({
  selections,
  activePart,
  zoom,
  onZoomChange,
  isFullscreen,
  onFullscreenToggle,
  showPartHighlight = true,
  onTogglePartHighlight,
  isLoading = false,
}: EnhancedCharacterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationOffset, setAnimationOffset] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Animation loop
  useEffect(() => {
    let animationId: number
    const animate = () => {
      setAnimationOffset((prev) => (prev + 0.01) % (Math.PI * 2))
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Canvas drawing (placeholder - would use actual drawing function)
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!

    // Set canvas size
    canvas.width = 64 * 6 * zoom
    canvas.height = 80 * 6 * zoom

    // Clear and draw character (placeholder)
    ctx.fillStyle = RETRO_UI_THEME.background.secondary
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add floating animation
    ctx.save()
    const floatY = Math.sin(animationOffset) * 2 * zoom
    ctx.translate(0, floatY)

    // Draw character placeholder
    ctx.fillStyle = RETRO_UI_THEME.accent.primary
    ctx.fillRect(canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.4, canvas.height * 0.6)

    ctx.restore()
  }, [selections, zoom, animationOffset])

  return (
    <EnhancedRetroPixelPanel title="LIVE PREVIEW" variant="accent" icon={<Eye className="h-4 w-4" />}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.secondary }}>
              ZOOM:
            </span>
            <button
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
              className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              style={{
                backgroundColor: RETRO_UI_THEME.background.secondary,
                borderColor: RETRO_UI_THEME.border.secondary,
                color: RETRO_UI_THEME.text.primary,
              }}
            >
              -
            </button>
            <span
              className="text-[9px] font-bold min-w-[3ch] text-center"
              style={{ color: RETRO_UI_THEME.text.primary }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
              disabled={zoom >= 2}
              className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              style={{
                backgroundColor: RETRO_UI_THEME.background.secondary,
                borderColor: RETRO_UI_THEME.border.secondary,
                color: RETRO_UI_THEME.text.primary,
              }}
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onTogglePartHighlight && (
              <button
                onClick={onTogglePartHighlight}
                className="w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5"
                style={{
                  backgroundColor: showPartHighlight
                    ? RETRO_UI_THEME.accent.primary
                    : RETRO_UI_THEME.background.secondary,
                  borderColor: showPartHighlight ? RETRO_UI_THEME.accent.secondary : RETRO_UI_THEME.border.secondary,
                  color: showPartHighlight ? RETRO_UI_THEME.background.primary : RETRO_UI_THEME.text.primary,
                }}
                title="Toggle part highlighting"
              >
                {showPartHighlight ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            )}

            <button
              onClick={onFullscreenToggle}
              className="w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5"
              style={{
                backgroundColor: RETRO_UI_THEME.background.secondary,
                borderColor: RETRO_UI_THEME.border.secondary,
                color: RETRO_UI_THEME.text.primary,
              }}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Character Frame */}
        <div
          className={`relative mx-auto border-4 overflow-hidden transition-all duration-300 ${
            isFullscreen ? "fixed inset-4 z-50 max-w-none" : "aspect-[64/80] w-full max-w-[500px]"
          }`}
          style={{
            backgroundColor: RETRO_UI_THEME.background.secondary,
            borderColor: RETRO_UI_THEME.border.primary,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-2 opacity-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  ${RETRO_UI_THEME.background.tertiary} 0px,
                  ${RETRO_UI_THEME.background.tertiary} 2px,
                  transparent 2px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  90deg,
                  ${RETRO_UI_THEME.background.tertiary} 0px,
                  ${RETRO_UI_THEME.background.tertiary} 2px,
                  transparent 2px,
                  transparent 8px
                )
              `,
            }}
          />

          {/* Canvas container */}
          <div className="absolute inset-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
              style={{ imageRendering: "pixelated" }}
              aria-label="8-bit pixel character preview"
            />
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RetroLoadingSpinner size="lg" />
                <span className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
                  UPDATING...
                </span>
              </div>
            </div>
          )}

          {/* Active part indicator */}
          {showPartHighlight && activePart && (
            <div
              className="absolute top-2 left-2 px-2 py-1 text-[8px] font-bold border-2"
              style={{
                backgroundColor: RETRO_UI_THEME.accent.primary,
                color: RETRO_UI_THEME.background.primary,
                borderColor: RETRO_UI_THEME.accent.secondary,
              }}
            >
              EDITING: {activePart.toUpperCase()}
            </div>
          )}

          {/* Hover controls */}
          {isHovered && !isFullscreen && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button
                className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200"
                style={{
                  backgroundColor: RETRO_UI_THEME.background.primary,
                  borderColor: RETRO_UI_THEME.border.primary,
                  color: RETRO_UI_THEME.text.primary,
                }}
                title="Rotate left"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
              <button
                className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200"
                style={{
                  backgroundColor: RETRO_UI_THEME.background.primary,
                  borderColor: RETRO_UI_THEME.border.primary,
                  color: RETRO_UI_THEME.text.primary,
                }}
                title="Rotate right"
              >
                <RotateCw className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Character info */}
        <div
          className="text-center text-[8px] p-2 border-2"
          style={{
            backgroundColor: RETRO_UI_THEME.background.secondary,
            borderColor: RETRO_UI_THEME.border.muted,
            color: RETRO_UI_THEME.text.muted,
          }}
        >
          RESOLUTION: {Math.round(64 * 6 * zoom)}×{Math.round(80 * 6 * zoom)} • SCALE: {zoom}x • PARTS: 8
        </div>
      </div>
    </EnhancedRetroPixelPanel>
  )
}
