"use client"

import { useState } from "react"
import { Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import type { PartKey } from "@/types/character"

interface ColorPalettePlaceholderProps {
  activePart: PartKey
  isMobile?: boolean
}

// Placeholder color palettes for different parts
const COLOR_PALETTES = {
  hair: ["#2C1810", "#8B4513", "#DAA520", "#DC143C", "#9370DB", "#00CED1"],
  body: ["#FDBCB4", "#EEA990", "#C68642", "#8D5524", "#654321", "#3C2414"],
  clothes: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
  eyes: ["#8B4513", "#4169E1", "#228B22", "#808080", "#9370DB", "#DC143C"],
  mouth: ["#DC143C", "#FF6347", "#CD5C5C", "#FF8C00", "#FF69B4", "#9370DB"],
  default: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
}

export function ColorPalettePlaceholder({ activePart, isMobile = false }: ColorPalettePlaceholderProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [previewColor, setPreviewColor] = useState<string | null>(null)

  // Don't show color variants for accessories
  if (activePart === "earring" || activePart === "glasses") {
    return null
  }

  const colors = COLOR_PALETTES[activePart] || COLOR_PALETTES.default

  if (isMobile) {
    // Mobile: Horizontal scrollable
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            COLOR VARIANTS
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-max px-1">
            {colors.map((color, index) => {
              const isSelected = selectedColor === color
              const isPreview = previewColor === color

              return (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  onMouseEnter={() => setPreviewColor(color)}
                  onMouseLeave={() => setPreviewColor(null)}
                  className="flex flex-col items-center gap-2 p-2 border-2 backdrop-blur-sm transition-all duration-200 min-w-[60px]"
                  style={{
                    backgroundColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.gold
                      : isPreview
                        ? PIXSELF_BRAND.colors.sky.light
                        : PIXSELF_BRAND.colors.cloud.light,
                    borderColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.navy
                      : PIXSELF_BRAND.colors.primary.navyLight,
                    boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 border-2 rounded-full"
                    style={{
                      backgroundColor: color,
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                    }}
                  />
                  <span
                    className="text-[6px] font-bold text-center"
                    style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                  >
                    #{index + 1}
                  </span>
                  {isSelected && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
            ← SWIPE →
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Grid layout
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
        <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
          COLOR VARIANTS
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {colors.map((color, index) => {
          const isSelected = selectedColor === color
          const isPreview = previewColor === color

          return (
            <button
              key={index}
              onClick={() => setSelectedColor(color)}
              onMouseEnter={() => setPreviewColor(color)}
              onMouseLeave={() => setPreviewColor(null)}
              className="flex flex-col items-center gap-2 p-3 border-2 backdrop-blur-sm transition-all duration-200"
              style={{
                backgroundColor: isSelected
                  ? PIXSELF_BRAND.colors.primary.gold
                  : isPreview
                    ? PIXSELF_BRAND.colors.sky.light
                    : PIXSELF_BRAND.colors.cloud.light,
                borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
              }}
            >
              <div
                className="w-10 h-10 border-2 rounded-full"
                style={{
                  backgroundColor: color,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                }}
              />
              <span className="text-[8px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                COLOR {index + 1}
              </span>
              {isSelected && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
