"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { RETRO_CHARACTER_PALETTES } from "@/config/8bit-theme"
import { generateVariantThumbnails } from "@/utils/thumbnail-generator"

interface EnhancedVariantGridProps {
  activePart: string
  currentVariant: number
  currentColor: number
  onVariantSelect: (variant: number) => void
  onPreview?: (variant: number) => void
  onPreviewEnd?: () => void
  isLoading?: boolean
  selections?: Record<string, { variant: number; color: number }>
  onSelectVariant?: (part: string, variant: number) => void
  loading?: boolean
}

export function EnhancedVariantGrid({
  activePart,
  currentVariant,
  currentColor,
  onVariantSelect,
  onPreview,
  onPreviewEnd,
  isLoading = false,

}: EnhancedVariantGridProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [loadingThumbnails, setLoadingThumbnails] = useState(true)
  const [previewVariant, setPreviewVariant] = useState<number | null>(null)

  // Generate thumbnails when part or color changes
  useEffect(() => {
    const generateThumbs = async () => {
      setLoadingThumbnails(true)
      try {
        const color = RETRO_CHARACTER_PALETTES[activePart as keyof typeof RETRO_CHARACTER_PALETTES]?.[currentColor] || "#FFFFFF"
        const thumbs = generateVariantThumbnails(activePart, color, 120)
        setThumbnails(thumbs)
      } catch (error) {
        console.error("Failed to generate thumbnails:", error)
        setThumbnails([])
      } finally {
        setLoadingThumbnails(false)
      }
    }

    generateThumbs()
  }, [activePart, currentColor])

  const handleVariantHover = (variant: number) => {
    setPreviewVariant(variant)
    if (onPreview) onPreview(variant)
  }

  const handleVariantLeave = () => {
    setPreviewVariant(null)
    if (onPreviewEnd) onPreviewEnd()
  }

  return (
    <div className="space-y-4">
      {/* Grid header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
          STYLE VARIANTS ({thumbnails.length}/10)
        </div>
        <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
          {previewVariant !== null ? `PREVIEWING VAR ${previewVariant + 1}` : `SELECTED VAR ${currentVariant + 1}`}
        </div>
      </div>

      {/* Variants grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
        {Array.from({ length: 10 }).map((_, i) => {
          const isSelected = currentVariant === i
          const isPreview = previewVariant === i
          const thumbnail = thumbnails[i]

          return (
            <button
              key={i}
              onClick={() => onVariantSelect(i)}
              onMouseEnter={() => handleVariantHover(i)}
              onMouseLeave={handleVariantLeave}
              disabled={isLoading || loadingThumbnails}
              aria-label={`Select variant ${i + 1}`}
              className={`
                relative aspect-square border-4 transition-all duration-200 overflow-hidden
                focus:outline-none focus:ring-4 focus:ring-opacity-50
                active:translate-x-1 active:translate-y-1
                disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0
                ${
                  isSelected
                    ? `scale-105 shadow-[0_0_20px_rgba(244,208,63,0.6)]`
                    : isPreview
                      ? "scale-102"
                      : "hover:scale-102"
                }
              `}
              style={{
                backgroundColor: isSelected ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.cloud.light,
                borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                imageRendering: "pixelated",

                boxShadow: isSelected
                  ? `0 0 20px ${PIXSELF_BRAND.colors.primary.gold}60, inset 0 0 10px ${PIXSELF_BRAND.colors.primary.gold}20`
                  : isPreview
                    ? `0 0 10px ${PIXSELF_BRAND.colors.sky.primary}40`
                    : "none",
              }}
            >
              {/* Thumbnail image */}
              {thumbnail && !loadingThumbnails ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail || "/placeholder.svg"}
                  alt={`Variant ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {loadingThumbnails ? (
                    <div className="space-y-1">
                      <div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: PIXSELF_BRAND.colors.primary.navy }}
                      />
                      <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                        LOADING
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-[6px] font-bold mb-1"
                        style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                      >
                        VAR
                      </div>
                      <div className="text-[10px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        {i + 1}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute top-1 right-1 w-4 h-4 border-2 flex items-center justify-center animate-pulse"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                    borderColor: PIXSELF_BRAND.colors.primary.navy,
                  }}
                >
                  <div className="w-2 h-2" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }} />
                </div>
              )}

              {/* Preview indicator */}
              {isPreview && !isSelected && (
                <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                  <div
                    className="w-6 h-6 border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                    }}
                  >
                    <Eye className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {(isLoading || loadingThumbnails) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Hover glow effect */}
              {!isSelected && (
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-200 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${PIXSELF_BRAND.colors.primary.gold} 0%, transparent 70%)`,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Variant info panel */}
      <div
        className="p-3 border-2 flex items-center justify-between"
        style={{
          backgroundColor: PIXSELF_BRAND.colors.sky.light,
          borderColor: PIXSELF_BRAND.colors.primary.navyLight,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 border-2 flex items-center justify-center text-[8px] font-bold"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.primary.gold,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              color: PIXSELF_BRAND.colors.primary.navy,
            }}
          >
            {(previewVariant ?? currentVariant) + 1}
          </div>
          <div>
            <div className="text-[10px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              VARIANT {(previewVariant ?? currentVariant) + 1} OF 10
            </div>
            <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              {previewVariant !== null ? "PREVIEW MODE" : "CURRENTLY SELECTED"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
            PART: {activePart.toUpperCase()}
          </div>
          <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
            COLOR: {currentColor + 1}
          </div>
        </div>
      </div>
    </div>
  )
}
