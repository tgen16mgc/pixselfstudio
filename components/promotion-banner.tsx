"use client"

import { useEffect, useState } from "react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface PromotionBannerProps {
  message?: string
  isActive?: boolean
}

export function PromotionBanner({
      message = "🌐 Please use External Browser (such as Safari or Chrome) for non-bug buying experience 🌐",
  isActive = false,
}: PromotionBannerProps) {
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number
      x: number
      delay: number
      duration: number
    }>
  >([])

  useEffect(() => {
    // Generate sparkles for the banner
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }))
    setSparkles(newSparkles)
  }, [])

  return (
    <div
      className="relative overflow-hidden border-4 animate-pulse"
      style={{
        height: "60px",
        background: isActive
          ? `linear-gradient(90deg, ${PIXSELF_BRAND.colors.accent.sparkle}40, ${PIXSELF_BRAND.colors.primary.gold}40, ${PIXSELF_BRAND.colors.accent.sparkle}40)`
          : `linear-gradient(90deg, ${PIXSELF_BRAND.colors.sky.light}60, ${PIXSELF_BRAND.colors.sky.primary}60, ${PIXSELF_BRAND.colors.sky.light}60)`,
        borderColor: isActive ? PIXSELF_BRAND.colors.accent.sparkle : PIXSELF_BRAND.colors.primary.navyLight,
        boxShadow: isActive
          ? `0 0 30px ${PIXSELF_BRAND.colors.accent.sparkle}60, inset 0 0 20px ${PIXSELF_BRAND.colors.primary.gold}30`
          : `0 0 20px ${PIXSELF_BRAND.colors.sky.primary}50, inset 0 0 15px ${PIXSELF_BRAND.colors.sky.light}40`,
        animation: "bannerGlow 2s ease-in-out infinite alternate",
      }}
    >
      {/* Animated background pattern - more visible */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              ${isActive ? PIXSELF_BRAND.colors.accent.sparkle : PIXSELF_BRAND.colors.sky.primary}60 0px,
              ${isActive ? PIXSELF_BRAND.colors.accent.sparkle : PIXSELF_BRAND.colors.sky.primary}60 3px,
              transparent 3px,
              transparent 12px
            )
          `,
          animation: "slide 2s linear infinite",
        }}
      />

      {/* Enhanced floating sparkles */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute animate-bounce opacity-100"
            style={{
              left: `${sparkle.x}%`,
              top: "50%",
              transform: "translateY(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: isActive ? PIXSELF_BRAND.colors.accent.star : PIXSELF_BRAND.colors.primary.gold,
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
              filter: "drop-shadow(0 0 4px currentColor)",
            }}
          />
        ))}
      </div>

      {/* Scrolling text with enhanced shadow */}
      <div className="absolute inset-0 flex items-center">
        <div
          className={`${press2p.className} whitespace-nowrap text-[10px] font-bold tracking-wider`}
          style={{
            color: isActive ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navy,
            textShadow: isActive
              ? `2px 2px 0px ${PIXSELF_BRAND.colors.accent.sparkle}, 1px 1px 10px ${PIXSELF_BRAND.colors.primary.gold}`
              : `2px 2px 0px ${PIXSELF_BRAND.colors.sky.light}, 1px 1px 8px ${PIXSELF_BRAND.colors.sky.primary}`,
            animation: "scroll 15s linear infinite",
            transform: "translateX(100%)",
          }}
        >
          {message}
        </div>
      </div>

      {/* Enhanced gradient edges */}
      <div
        className="absolute left-0 top-0 w-24 h-full pointer-events-none"
        style={{
          background: `linear-gradient(to right, 
            ${isActive ? PIXSELF_BRAND.colors.accent.sparkle : PIXSELF_BRAND.colors.sky.light}60, 
            transparent)`,
        }}
      />
      <div
        className="absolute right-0 top-0 w-24 h-full pointer-events-none"
        style={{
          background: `linear-gradient(to left, 
            ${isActive ? PIXSELF_BRAND.colors.accent.sparkle : PIXSELF_BRAND.colors.sky.light}60, 
            transparent)`,
        }}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(12px); }
        }
        
        @keyframes bannerGlow {
          0% { 
            box-shadow: ${
              isActive
                ? `0 0 30px ${PIXSELF_BRAND.colors.accent.sparkle}60, inset 0 0 20px ${PIXSELF_BRAND.colors.primary.gold}30`
                : `0 0 20px ${PIXSELF_BRAND.colors.sky.primary}50, inset 0 0 15px ${PIXSELF_BRAND.colors.sky.light}40`
            };
          }
          100% { 
            box-shadow: ${
              isActive
                ? `0 0 40px ${PIXSELF_BRAND.colors.accent.sparkle}80, inset 0 0 30px ${PIXSELF_BRAND.colors.primary.gold}50`
                : `0 0 30px ${PIXSELF_BRAND.colors.sky.primary}70, inset 0 0 25px ${PIXSELF_BRAND.colors.sky.light}60`
            };
          }
        }
      `}</style>
    </div>
  )
}
