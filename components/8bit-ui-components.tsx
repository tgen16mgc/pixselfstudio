"use client"

import type React from "react"
import { RETRO_UI_THEME } from "@/config/8bit-theme"

// 8-bit Panel Component
interface RetroPixelPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  variant?: "primary" | "secondary" | "accent"
}

export function RetroPixelPanel({ children, className = "", title, variant = "primary" }: RetroPixelPanelProps) {
  const getBorderStyle = () => {
    switch (variant) {
      case "accent":
        return `border-4 border-[${RETRO_UI_THEME.accent.primary}]`
      case "secondary":
        return `border-4 border-[${RETRO_UI_THEME.border.secondary}]`
      default:
        return `border-4 border-[${RETRO_UI_THEME.border.primary}]`
    }
  }

  const getBackgroundStyle = () => {
    return `bg-[${RETRO_UI_THEME.background.primary}]`
  }

  return (
    <div className={`${getBackgroundStyle()} ${getBorderStyle()} relative ${className}`}>
      {title && (
        <div
          className="px-4 py-2 text-[12px] font-bold tracking-wider border-b-4"
          style={{
            backgroundColor: variant === "accent" ? RETRO_UI_THEME.accent.primary : RETRO_UI_THEME.border.primary,
            color: RETRO_UI_THEME.background.primary,
            borderBottomColor: variant === "accent" ? RETRO_UI_THEME.accent.secondary : RETRO_UI_THEME.border.secondary,
          }}
        >
          {title}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

// 8-bit Button Component
interface RetroPixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "accent" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

export function RetroPixelButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: RetroPixelButtonProps) {
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
    if (disabled) {
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
      disabled={disabled}
      className={`
        ${getSizeClasses()} 
        font-bold tracking-wider border-4 
        transition-all duration-100 
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
        hover:brightness-110
        ${className}
      `}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        imageRendering: "pixelated",
      }}
    >
      {children}
    </button>
  )
}

// 8-bit Color Swatch Component
interface RetroColorSwatchProps {
  color: string
  selected: boolean
  onClick: () => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function RetroColorSwatch({ color, selected, onClick, size = "md", disabled = false }: RetroColorSwatchProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8"
      case "lg":
        return "w-16 h-16"
      default:
        return "w-12 h-12"
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getSizeClasses()}
        border-4 transition-all duration-100
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
        ${
          selected
            ? `border-[${RETRO_UI_THEME.accent.primary}] scale-110`
            : `border-[${RETRO_UI_THEME.border.secondary}] hover:border-[${RETRO_UI_THEME.border.primary}]`
        }
      `}
      style={{
        backgroundColor: color,
        imageRendering: "pixelated",
      }}
    >
      {selected && (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}CC` }}>
          <div
            className="w-3 h-3 border-2"
            style={{
              backgroundColor: RETRO_UI_THEME.text.primary,
              borderColor: RETRO_UI_THEME.background.primary,
            }}
          />
        </div>
      )}
    </button>
  )
}

// 8-bit Progress Bar Component
interface RetroProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
}

export function RetroProgressBar({ value, max, label, color = RETRO_UI_THEME.accent.success }: RetroProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100)
  const filledBlocks = Math.floor(percentage / 10)

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between">
          <span className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.secondary }}>
            {label}
          </span>
          <span className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
            {value}
          </span>
        </div>
      )}
      <div
        className="h-4 border-2 flex"
        style={{
          backgroundColor: RETRO_UI_THEME.background.secondary,
          borderColor: RETRO_UI_THEME.border.secondary,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r-2 last:border-r-0"
            style={{
              backgroundColor: i < filledBlocks ? color : "transparent",
              borderRightColor: RETRO_UI_THEME.border.muted,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// 8-bit Icon Button Component
interface RetroIconButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "accent"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  title?: string
}

export function RetroIconButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  title,
}: RetroIconButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8"
      case "lg":
        return "w-12 h-12"
      default:
        return "w-10 h-10"
    }
  }

  const getVariantStyles = () => {
    if (disabled) {
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
      disabled={disabled}
      title={title}
      className={`
        ${getSizeClasses()}
        flex items-center justify-center
        border-4 transition-all duration-100
        active:translate-x-1 active:translate-y-1
        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
        hover:brightness-110
      `}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        imageRendering: "pixelated",
      }}
    >
      {children}
    </button>
  )
}
