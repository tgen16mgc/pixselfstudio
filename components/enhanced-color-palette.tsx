"use client"
import { useState, useRef, useEffect } from "react"
import { Palette, Eye, Info, Check, AlertTriangle } from "lucide-react"
import type { ColorPalette } from "@/config/enhanced-color-system"
import { calculateContrastRatio, isColorBlindSafe } from "@/config/enhanced-color-system"

interface EnhancedColorPaletteProps {
  palette: ColorPalette
  selectedIndex: number
  onColorSelect: (index: number) => void
  soundEnabled: boolean
  showAccessibilityInfo?: boolean
  colorBlindnessFilter?: "none" | "deuteranopia" | "protanopia" | "tritanopia"
}

export function EnhancedColorPalette({
  palette,
  selectedIndex,
  onColorSelect,
  soundEnabled,
  showAccessibilityInfo = false,
  colorBlindnessFilter = "none",
}: EnhancedColorPaletteProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [showPreview, setShowPreview] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentFocus = focusedIndex >= 0 ? focusedIndex : selectedIndex

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          const prevIndex = currentFocus > 0 ? currentFocus - 1 : palette.colors.length - 1
          setFocusedIndex(prevIndex)
          break
        case "ArrowRight":
          e.preventDefault()
          const nextIndex = currentFocus < palette.colors.length - 1 ? currentFocus + 1 : 0
          setFocusedIndex(nextIndex)
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (focusedIndex >= 0) {
            onColorSelect(focusedIndex)
            playSound("click", soundEnabled)
          }
          break
        case "Escape":
          setFocusedIndex(-1)
          break
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [focusedIndex, selectedIndex, palette.colors.length, onColorSelect, soundEnabled])

  const playSound = (type: "click" | "hover", enabled: boolean) => {
    if (!enabled) return
    // Sound implementation here
  }

  const applyColorBlindnessFilter = (color: string): string => {
    if (colorBlindnessFilter === "none") return color

    // Simplified color blindness simulation
    const rgb = Number.parseInt(color.slice(1), 16)
    let r = (rgb >> 16) & 0xff
    let g = (rgb >> 8) & 0xff
    let b = (rgb >> 0) & 0xff

    switch (colorBlindnessFilter) {
      case "deuteranopia": // Green-blind
        g = (r + b) / 2
        break
      case "protanopia": // Red-blind
        r = (g + b) / 2
        break
      case "tritanopia": // Blue-blind
        b = (r + g) / 2
        break
    }

    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* Palette Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#00d4ff]" />
          <div className="text-[11px] text-[#F5DEB3] font-bold">{palette.name.toUpperCase()}</div>
          <div className="text-[8px] text-[#87CEEB] bg-[#2a2a2a] px-2 py-1 rounded">
            {palette.harmony} • {palette.temperature}
          </div>
        </div>

        {showAccessibilityInfo && (
          <button
            onClick={() => setShowPreview(showPreview === -1 ? 0 : -1)}
            className="text-[8px] text-[#87CEEB] hover:text-[#00d4ff] transition-colors flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            A11Y Info
          </button>
        )}
      </div>

      {/* Color Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-3 sm:grid-cols-6 gap-3"
        role="radiogroup"
        aria-label={`${palette.name} color selection`}
        tabIndex={0}
      >
        {palette.colors.map((colorDef, index) => {
          const isSelected = selectedIndex === index
          const isFocused = focusedIndex === index
          const displayColor = applyColorBlindnessFilter(colorDef.hex)
          const contrastRatio = calculateContrastRatio(colorDef.hex, "#1a1a1a")
          const isAccessible = contrastRatio >= 3.0
          const isColorBlindFriendly = isColorBlindSafe(colorDef.hex)

          return (
            <div key={index} className="relative">
              <button
                role="radio"
                aria-checked={isSelected}
                aria-label={`${colorDef.name}: ${colorDef.description}`}
                aria-describedby={showAccessibilityInfo ? `color-${index}-info` : undefined}
                onClick={() => {
                  onColorSelect(index)
                  playSound("click", soundEnabled)
                }}
                onMouseEnter={() => {
                  setShowPreview(index)
                  playSound("hover", soundEnabled)
                }}
                onMouseLeave={() => setShowPreview(-1)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                className={`
                  group relative aspect-square min-h-[56px] border-2 transition-all duration-200 rounded-lg overflow-hidden
                  focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]
                  ${
                    isSelected
                      ? "border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.8)] scale-110 z-10"
                      : isFocused
                        ? "border-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.4)] scale-105"
                        : "border-[#555] hover:border-[#00d4ff] hover:scale-105"
                  }
                `}
                style={{ backgroundColor: displayColor }}
              >
                {/* Accessibility Indicators */}
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                  {!isAccessible && (
                    <div className="w-3 h-3 bg-red-500 rounded-full border border-white/50 flex items-center justify-center">
                      <AlertTriangle className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {isColorBlindFriendly && (
                    <div className="w-3 h-3 bg-green-500 rounded-full border border-white/50 flex items-center justify-center">
                      <Eye className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/90 rounded-full border-2 border-[#00d4ff] flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-[#00d4ff]" />
                      </div>
                    </div>
                  </>
                )}

                {/* Hover Preview */}
                {showPreview === index && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] border border-[#00d4ff] rounded px-2 py-1 text-[8px] text-[#F5DEB3] whitespace-nowrap z-20 shadow-lg">
                    {colorDef.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#00d4ff]"></div>
                  </div>
                )}

                {/* Pattern overlay for better visibility */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)`,
                      backgroundSize: "8px 8px",
                    }}
                  />
                </div>
              </button>

              {/* Accessibility Info Panel */}
              {showAccessibilityInfo && showPreview === index && (
                <div
                  id={`color-${index}-info`}
                  className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-[#00d4ff] rounded-lg p-3 text-[8px] text-[#F5DEB3] min-w-[200px] z-30 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="font-bold text-[#00d4ff]">{colorDef.name}</div>
                    <div>{colorDef.description}</div>
                    <div className="border-t border-[#555] pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Contrast Ratio:</span>
                        <span className={contrastRatio >= 3.0 ? "text-green-400" : "text-red-400"}>
                          {contrastRatio.toFixed(1)}:1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>WCAG AA:</span>
                        <span className={contrastRatio >= 3.0 ? "text-green-400" : "text-red-400"}>
                          {contrastRatio >= 3.0 ? "Pass" : "Fail"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Color Blind Safe:</span>
                        <span className={isColorBlindFriendly ? "text-green-400" : "text-yellow-400"}>
                          {isColorBlindFriendly ? "Yes" : "Partial"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Color Info */}
      <div className="bg-[#2a2a2a] border border-[#555] rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded border-2 border-[#00d4ff] flex-shrink-0"
            style={{ backgroundColor: applyColorBlindnessFilter(palette.colors[selectedIndex].hex) }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-[#F5DEB3] truncate">{palette.colors[selectedIndex].name}</div>
            <div className="text-[8px] text-[#87CEEB] truncate">{palette.colors[selectedIndex].description}</div>
            <div className="text-[8px] text-[#DEB887] font-mono">{palette.colors[selectedIndex].hex}</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-[#87CEEB]">Contrast</div>
            <div
              className={`text-[9px] font-bold ${
                calculateContrastRatio(palette.colors[selectedIndex].hex, "#1a1a1a") >= 3.0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {calculateContrastRatio(palette.colors[selectedIndex].hex, "#1a1a1a").toFixed(1)}:1
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
