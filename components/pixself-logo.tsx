"use client"

import { PIXSELF_BRAND } from "@/config/pixself-brand"

interface PixselfLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  animated?: boolean
  className?: string
  clickable?: boolean
}

export function PixselfLogo({
  size = "md",
  showText = true,
  animated = true,
  className = "",
  clickable = false,
}: PixselfLogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 max-w-[120px]"
      case "lg":
        return "h-16 max-w-[240px]"
      case "xl":
        return "h-20 max-w-[300px]"
      default:
        return "h-12 max-w-[180px]"
    }
  }

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-[12px]"
      case "lg":
        return "text-[20px]"
      case "xl":
        return "text-[24px]"
      default:
        return "text-[16px]"
    }
  }

  const handleClick = () => {
    if (clickable) {
      window.open("https://www.facebook.com/wearepixself?locale=vi_VN", "_blank")
    }
  }

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image - Fixed aspect ratio and responsive */}
      <div className="relative flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/image/logo.png"
          alt="Pixself: The Studio Logo"
          className={`${getSizeClasses()} w-auto object-contain ${animated ? "hover:scale-105 transition-transform duration-200" : ""}`}
          style={{
            imageRendering: "pixelated",
            filter: animated ? `drop-shadow(0 0 8px ${PIXSELF_BRAND.colors.accent.sparkle}60)` : "none",
          }}
        />

        {/* Animated glow effect */}
        {animated && (
          <div
            className="absolute inset-0 animate-pulse opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${PIXSELF_BRAND.colors.accent.sparkle}30 0%, transparent 70%)`,
              filter: "blur(6px)",
              zIndex: -1,
            }}
          />
        )}
      </div>

      {/* Optional text */}
      {showText && (
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`${getTextSize()} font-bold tracking-wider leading-tight truncate`}
            style={{
              color: PIXSELF_BRAND.colors.primary.navy,
              textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.gold}`,
            }}
          >
            PIXSELF
          </span>
          <span className="text-[8px] tracking-wide truncate" style={{ color: PIXSELF_BRAND.colors.sky.primary }}>
            The Studio
          </span>
        </div>
      )}
    </div>
  )

  if (clickable) {
    return (
      <button
        onClick={handleClick}
        className={`transition-all duration-200 ${animated ? "hover:scale-105 active:scale-95" : ""} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={{

        }}
        title="Visit our Facebook page"
      >
        <LogoContent />
      </button>
    )
  }

  return <LogoContent />
}
