"use client"

import React from "react"
import { PIXSELF_BRAND, BRAND_COMPONENTS } from "@/config/pixself-brand"

// Pixself Button Component
interface PixselfButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "accent"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
  icon?: React.ReactNode
}

export function PixselfButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  fullWidth = false,
  icon,
}: PixselfButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-[10px]"
      case "lg":
        return "px-6 py-4 text-[14px]"
      default:
        return "px-4 py-3 text-[12px]"
    }
  }

  const getVariantStyles = () => {
    if (disabled || loading) {
      return {
        backgroundColor: PIXSELF_BRAND.colors.ui.muted,
        color: PIXSELF_BRAND.colors.cloud.white,
        borderColor: PIXSELF_BRAND.colors.primary.navyLight,
      }
    }

    const variantConfig = BRAND_COMPONENTS.button[variant]
    return {
      backgroundColor: variantConfig.bg,
      color: variantConfig.color,
      borderColor: variantConfig.border,
      boxShadow: variantConfig.shadow,
    }
  }

  const styles = getVariantStyles()

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getSizeClasses()} 
        ${fullWidth ? "w-full" : ""}
        font-bold tracking-wider border-4 
        transition-all duration-200 
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
        hover:brightness-110 hover:scale-105
        ${className}
      `}
      style={{
        ...styles,
        imageRendering: "pixelated",
        focusRingColor: PIXSELF_BRAND.colors.accent.sparkle,
      }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}

// Pixself Panel Component
interface PixselfPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  variant?: "primary" | "secondary"
  collapsible?: boolean
  defaultCollapsed?: boolean
  icon?: React.ReactNode
}

export function PixselfPanel({
  children,
  className = "",
  title,
  variant = "primary",
  collapsible = false,
  defaultCollapsed = false,
  icon,
}: PixselfPanelProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const panelConfig = BRAND_COMPONENTS.panel[variant]

  return (
    <div
      className={`border-4 relative backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: panelConfig.bg,
        borderColor: panelConfig.border,
        boxShadow: panelConfig.shadow,
        imageRendering: "pixelated",
      }}
    >
      {title && (
        <div
          className={`px-4 py-3 text-[12px] font-bold tracking-wider border-b-4 flex items-center justify-between ${
            collapsible ? "cursor-pointer hover:brightness-110" : ""
          }`}
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            color: PIXSELF_BRAND.colors.primary.navy,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
          onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
        >
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {collapsible && (
            <div
              className="transition-transform duration-200"
              style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▲
            </div>
          )}
        </div>
      )}
      <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0" : "max-h-[2000px]"}`}>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Pixself Color Swatch Component
interface PixselfColorSwatchProps {
  color: string
  colorName?: string
  selected: boolean
  onClick: () => void
  onPreview?: (color: string) => void
  onPreviewEnd?: () => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  showPreview?: boolean
}

export function PixselfColorSwatch({
  color,
  colorName,
  selected,
  onClick,
  onPreview,
  onPreviewEnd,
  size = "md",
  disabled = false,
  showPreview = true,
}: PixselfColorSwatchProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-10 h-10"
      case "lg":
        return "w-16 h-16"
      default:
        return "w-14 h-14"
    }
  }

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => {
          setIsHovered(true)
          if (showPreview && onPreview) onPreview(color)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          if (showPreview && onPreviewEnd) onPreviewEnd()
        }}
        disabled={disabled}
        aria-label={`Select color ${colorName || color}`}
        className={`
          ${getSizeClasses()}
          border-4 transition-all duration-200 relative overflow-hidden
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          active:translate-x-1 active:translate-y-1
          disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0
          ${selected ? "scale-110" : "hover:scale-105"}
        `}
        style={{
          backgroundColor: color,
          borderColor: selected ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.primary.navy,
          boxShadow: selected ? PIXSELF_BRAND.shadows.glowStrong : PIXSELF_BRAND.shadows.pixel,
          imageRendering: "pixelated",
          focusRingColor: PIXSELF_BRAND.colors.accent.sparkle,
        }}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-4 h-4 border-2 flex items-center justify-center"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
              }}
            >
              <div className="w-2 h-2" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }} />
            </div>
          </div>
        )}

        {/* Hover sparkle effect */}
        {isHovered && !selected && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
        )}
      </button>

      {/* Color name tooltip */}
      {colorName && isHovered && (
        <div
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-[8px] font-bold whitespace-nowrap z-50 border-2"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.cloud.white,
            color: PIXSELF_BRAND.colors.primary.navy,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            boxShadow: PIXSELF_BRAND.shadows.pixel,
          }}
        >
          {colorName}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: PIXSELF_BRAND.colors.primary.navy }}
          />
        </div>
      )}
    </div>
  )
}

// Pixself Progress Bar Component
interface PixselfProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
  animated?: boolean
  showValue?: boolean
}

export function PixselfProgressBar({
  value,
  max,
  label,
  color = PIXSELF_BRAND.colors.primary.gold,
  animated = true,
  showValue = true,
}: PixselfProgressBarProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const percentage = Math.min(100, (value / max) * 100)
  const filledBlocks = Math.floor(percentage / 10)

  // Animate value changes
  React.useEffect(() => {
    if (animated) {
      const duration = 500
      const steps = 20
      const stepValue = (value - displayValue) / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        setDisplayValue((prev) => {
          const newValue = prev + stepValue
          if (currentStep >= steps) {
            clearInterval(interval)
            return value
          }
          return newValue
        })
      }, stepDuration)

      return () => clearInterval(interval)
    } else {
      setDisplayValue(value)
    }
  }, [value, animated, displayValue])

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            {label}
          </span>
          {showValue && (
            <span className="text-[10px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              {Math.round(displayValue)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className="h-5 border-4 flex relative overflow-hidden"
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.light,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.pixel,
        }}
      >
        {/* Background blocks */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r-2 last:border-r-0 relative"
            style={{
              borderRightColor: PIXSELF_BRAND.colors.primary.navyLight,
            }}
          >
            {/* Filled block */}
            {i < filledBlocks && (
              <div className="absolute inset-0 transition-all duration-100" style={{ backgroundColor: color }} />
            )}

            {/* Partial fill for the current block */}
            {i === filledBlocks && percentage % 10 > 0 && (
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  backgroundColor: color,
                  width: `${(percentage % 10) * 10}%`,
                }}
              />
            )}
          </div>
        ))}

        {/* Animated sparkle effect */}
        {animated && filledBlocks > 0 && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
