"use client"

import { useState } from "react"
import { Eye, Settings, Info } from "lucide-react"

interface AccessibilityControlsProps {
  colorBlindnessFilter: "none" | "deuteranopia" | "protanopia" | "tritanopia"
  onFilterChange: (filter: "none" | "deuteranopia" | "protanopia" | "tritanopia") => void
  showAccessibilityInfo: boolean
  onToggleAccessibilityInfo: (show: boolean) => void
}

export function AccessibilityControls({
  colorBlindnessFilter,
  onFilterChange,
  showAccessibilityInfo,
  onToggleAccessibilityInfo,
}: AccessibilityControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const filterOptions = [
    { value: "none" as const, label: "Normal Vision", description: "No color vision simulation" },
    { value: "deuteranopia" as const, label: "Deuteranopia", description: "Green color blindness (~6% of males)" },
    { value: "protanopia" as const, label: "Protanopia", description: "Red color blindness (~2% of males)" },
    { value: "tritanopia" as const, label: "Tritanopia", description: "Blue color blindness (~0.003% of population)" },
  ]

  return (
    <div className="bg-[#2a2a2a] border border-[#555] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-[#333] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-[#00d4ff]" />
          <span className="text-[10px] font-bold text-[#F5DEB3]">ACCESSIBILITY OPTIONS</span>
        </div>
        <div className="text-[8px] text-[#87CEEB]">{isExpanded ? "Hide" : "Show"}</div>
      </button>

      {isExpanded && (
        <div className="border-t border-[#555] p-3 space-y-4">
          {/* Color Blindness Simulation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-3.5 w-3.5 text-[#00d4ff]" />
              <span className="text-[9px] font-bold text-[#F5DEB3]">Color Vision Simulation</span>
            </div>
            <div className="space-y-2">
              {filterOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorBlindnessFilter"
                    value={option.value}
                    checked={colorBlindnessFilter === option.value}
                    onChange={() => onFilterChange(option.value)}
                    className="mt-0.5 w-3 h-3 text-[#00d4ff] bg-[#1a1a1a] border-[#555] focus:ring-[#00d4ff] focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-[8px] font-bold text-[#F5DEB3]">{option.label}</div>
                    <div className="text-[7px] text-[#87CEEB]">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Info Toggle */}
          <div className="border-t border-[#555] pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAccessibilityInfo}
                onChange={(e) => onToggleAccessibilityInfo(e.target.checked)}
                className="w-3 h-3 text-[#00d4ff] bg-[#1a1a1a] border-[#555] focus:ring-[#00d4ff] focus:ring-2"
              />
              <Info className="h-3.5 w-3.5 text-[#00d4ff]" />
              <span className="text-[9px] font-bold text-[#F5DEB3]">Show Accessibility Information</span>
            </label>
            <div className="text-[7px] text-[#87CEEB] ml-5 mt-1">
              Display contrast ratios and color blindness compatibility
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
