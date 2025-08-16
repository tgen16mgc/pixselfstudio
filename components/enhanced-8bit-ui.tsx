"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { RETRO_UI_THEME } from "@/config/8bit-theme"
import { ChevronUp, Eye } from "lucide-react"

// Enhanced Panel with better visual hierarchy
interface EnhancedRetroPixelPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  variant?: "primary" | "secondary" | "accent"
  collapsible?: boolean
  defaultCollapsed?: boolean
  icon?: React.ReactNode
}

export function EnhancedRetroPixelPanel({
  children,
  className = "",
  title,
  variant = "primary",
  collapsible = false,
  defaultCollapsed = false,
  icon,
}: EnhancedRetroPixelPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const getBorderStyle = () => {
    switch (variant) {
      case "accent":
        return `border-4 border-[${RETRO_UI_THEME.accent.primary}] shadow-[4px_4px_0px_${RETRO_UI_THEME.accent.secondary}]`
      case "secondary":
        return `border-4 border-[${RETRO_UI_THEME.border.secondary}] shadow-[4px_4px_0px_${RETRO_UI_THEME.border.muted}]`
      default:
        return `border-4 border-[${RETRO_UI_THEME.border.primary}] shadow-[4px_4px_0px_${RETRO_UI_THEME.border.secondary}]`
    }
  }

  return (
    <div className={`bg-[${RETRO_UI_THEME.background.primary}] ${getBorderStyle()} relative ${className}`}>
      {title && (
        <div
          className={`px-4 py-3 text-[12px] font-bold tracking-wider border-b-4 flex items-center justify-between ${
            collapsible ? "cursor-pointer hover:brightness-110" : ""
          }`}
          style={{
            backgroundColor: variant === "accent" ? RETRO_UI_THEME.accent.primary : RETRO_UI_THEME.border.primary,
            color: RETRO_UI_THEME.background.primary,
            borderBottomColor: variant === "accent" ? RETRO_UI_THEME.accent.secondary : RETRO_UI_THEME.border.secondary,
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
              <ChevronUp className="h-4 w-4" />
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

// Enhanced Color Swatch with preview and better accessibility
interface EnhancedRetroColorSwatchProps {
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

export function EnhancedRetroColorSwatch({
  color,
  colorName,
  selected,
  onClick,
  onPreview,
  onPreviewEnd,
  size = "md",
  disabled = false,
  showPreview = true,
}: EnhancedRetroColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false)

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
          focus:outline-none focus:ring-4 focus:ring-[${RETRO_UI_THEME.accent.primary}] focus:ring-offset-2
          active:translate-x-1 active:translate-y-1
          disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0
          ${
            selected
              ? `border-[${RETRO_UI_THEME.accent.primary}] scale-110 shadow-[0_0_0_2px_${RETRO_UI_THEME.accent.secondary}]`
              : `border-[${RETRO_UI_THEME.border.secondary}] hover:border-[${RETRO_UI_THEME.border.primary}] hover:scale-105`
          }
        `}
        style={{
          backgroundColor: color,
          imageRendering: "pixelated",
        }}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-4 h-4 border-2 flex items-center justify-center"
              style={{
                backgroundColor: RETRO_UI_THEME.text.primary,
                borderColor: RETRO_UI_THEME.background.primary,
              }}
            >
              <div className="w-2 h-2" style={{ backgroundColor: RETRO_UI_THEME.background.primary }} />
            </div>
          </div>
        )}

        {/* Hover effect */}
        {isHovered && !selected && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <Eye className="h-4 w-4" style={{ color: RETRO_UI_THEME.text.primary }} />
          </div>
        )}
      </button>

      {/* Color name tooltip */}
      {colorName && isHovered && (
        <div
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-[8px] font-bold whitespace-nowrap z-50 border-2"
          style={{
            backgroundColor: RETRO_UI_THEME.background.primary,
            color: RETRO_UI_THEME.text.primary,
            borderColor: RETRO_UI_THEME.border.primary,
          }}
        >
          {colorName}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: RETRO_UI_THEME.border.primary }}
          />
        </div>
      )}
    </div>
  )
}

// Enhanced Variant Button with visual preview
interface EnhancedVariantButtonProps {
  variant: number
  selected: boolean
  onClick: () => void
  onPreview?: (variant: number) => void
  onPreviewEnd?: () => void
  previewImage?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function EnhancedVariantButton({
  variant,
  selected,
  onClick,
  onPreview,
  onPreviewEnd,
  previewImage,
  disabled = false,
  size = "md",
}: EnhancedVariantButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-16 h-16"
      case "lg":
        return "w-24 h-24"
      default:
        return "w-20 h-20"
    }
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true)
        if (onPreview) onPreview(variant)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        if (onPreviewEnd) onPreviewEnd()
      }}
      disabled={disabled}
      aria-label={`Select variant ${variant + 1}`}
      className={`
        ${getSizeClasses()}
        border-4 transition-all duration-200 relative overflow-hidden
        flex flex-col items-center justify-center text-[8px] font-bold
        focus:outline-none focus:ring-4 focus:ring-[${RETRO_UI_THEME.accent.primary}] focus:ring-offset-2
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0
        ${selected ? `scale-105 shadow-[0_0_0_2px_${RETRO_UI_THEME.accent.secondary}]` : "hover:scale-102"}
      `}
      style={{
        backgroundColor: selected ? RETRO_UI_THEME.accent.primary : RETRO_UI_THEME.background.secondary,
        color: selected ? RETRO_UI_THEME.background.primary : RETRO_UI_THEME.text.primary,
        borderColor: selected ? RETRO_UI_THEME.accent.secondary : RETRO_UI_THEME.border.secondary,
        imageRendering: "pixelated",
      }}
    >
      {/* Preview image or placeholder */}
      {previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewImage || "/placeholder.svg"}
          alt={`Variant ${variant + 1}`}
          className="w-full h-full object-contain p-1"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <>
          <div className="text-[6px] mb-1">VAR</div>
          <div className="text-[10px]">{variant + 1}</div>
        </>
      )}

      {/* Selection indicator */}
      {selected && (
        <div
          className="absolute top-1 right-1 w-3 h-3 border-2"
          style={{
            backgroundColor: RETRO_UI_THEME.background.primary,
            borderColor: RETRO_UI_THEME.accent.secondary,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1" style={{ backgroundColor: RETRO_UI_THEME.accent.secondary }} />
          </div>
        </div>
      )}

      {/* Preview indicator */}
      {isHovered && !selected && (
        <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
          <Eye className="h-3 w-3" style={{ color: RETRO_UI_THEME.text.primary }} />
        </div>
      )}
    </button>
  )
}

// Enhanced Progress Bar with animation
interface EnhancedRetroProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
  animated?: boolean
  showValue?: boolean
}

export function EnhancedRetroProgressBar({
  value,
  max,
  label,
  color = RETRO_UI_THEME.accent.success,
  animated = true,
  showValue = true,
}: EnhancedRetroProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min(100, (value / max) * 100)
  const filledBlocks = Math.floor(percentage / 10)

  // Animate value changes
  useEffect(() => {
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
          <span className="text-[10px] font-bold tracking-wider" style={{ color: RETRO_UI_THEME.text.secondary }}>
            {label}
          </span>
          {showValue && (
            <span className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
              {Math.round(displayValue)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className="h-5 border-4 flex relative overflow-hidden"
        style={{
          backgroundColor: RETRO_UI_THEME.background.secondary,
          borderColor: RETRO_UI_THEME.border.secondary,
        }}
      >
        {/* Background blocks */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r-2 last:border-r-0 relative"
            style={{
              borderRightColor: RETRO_UI_THEME.border.muted,
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

        {/* Animated shine effect */}
        {animated && filledBlocks > 0 && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}

// Loading Spinner Component
export function RetroLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4"
      case "lg":
        return "w-8 h-8"
      default:
        return "w-6 h-6"
    }
  }

  return (
    <div className={`${getSizeClasses()} relative`}>
      {/* Spinning blocks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 animate-pulse"
          style={{
            backgroundColor: RETRO_UI_THEME.accent.primary,
            left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
            top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
            animationDelay: `${i * 0.1}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}

// Enhanced Button with better states
interface EnhancedRetroPixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "accent" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
  icon?: React.ReactNode
}

export function EnhancedRetroPixelButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  fullWidth = false,
  icon,
}: EnhancedRetroPixelButtonProps) {
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
        backgroundColor: RETRO_UI_THEME.background.secondary,
        color: RETRO_UI_THEME.text.muted,
        borderColor: RETRO_UI_THEME.border.muted,
      }
    }

    switch (variant) {
      case "accent":
        return {
          backgroundColor: RETRO_UI_THEME.accent.primary,
          color: RETRO_UI_THEME.background.primary,
          borderColor: RETRO_UI_THEME.accent.secondary,
        }
      case "danger":
        return {
          backgroundColor: RETRO_UI_THEME.accent.error,
          color: RETRO_UI_THEME.text.primary,
          borderColor: RETRO_UI_THEME.accent.warning,
        }
      case "secondary":
        return {
          backgroundColor: RETRO_UI_THEME.background.secondary,
          color: RETRO_UI_THEME.text.primary,
          borderColor: RETRO_UI_THEME.border.secondary,
        }
      default:
        return {
          backgroundColor: RETRO_UI_THEME.background.tertiary,
          color: RETRO_UI_THEME.text.primary,
          borderColor: RETRO_UI_THEME.border.primary,
        }
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
        focus:outline-none focus:ring-4 focus:ring-[${RETRO_UI_THEME.accent.primary}] focus:ring-offset-2
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
        hover:brightness-110 hover:shadow-[2px_2px_0px_${RETRO_UI_THEME.border.muted}]
        ${className}
      `}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        imageRendering: "pixelated",
      }}
    >
      {loading ? (
        <RetroLoadingSpinner size="sm" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
