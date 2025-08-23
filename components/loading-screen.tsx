"use client"

import { useEffect, useState } from "react"
import { PixselfLogo } from "./pixself-logo"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [showTagline, setShowTagline] = useState(false)
  const [pixelEffects, setPixelEffects] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      duration: number
      type: "square" | "cross" | "diamond"
      color: string
    }>
  >([])

  useEffect(() => {
    // Generate 8-bit pixel effects
    const effects = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      type: ["square", "cross", "diamond"][Math.floor(Math.random() * 3)] as "square" | "cross" | "diamond",
      color: [
        PIXSELF_BRAND.colors.accent.sparkle,
        PIXSELF_BRAND.colors.primary.gold,
        PIXSELF_BRAND.colors.sky.primary,
        "#FFFFFF",
      ][Math.floor(Math.random() * 4)],
    }))
    setPixelEffects(effects)

    // Show logo after a brief delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true)
    }, 300)

    // Start progress animation
    const progressTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // Show tagline when loading is complete
            setShowTagline(true)
            // Complete loading after showing tagline
            setTimeout(() => {
              onComplete()
            }, 1000)
            return 100
          }
          // Simulate realistic loading with some randomness
          const increment = Math.random() * 15 + 5
          return Math.min(prev + increment, 100)
        })
      }, 150)

      return () => clearInterval(interval)
    }, 800)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(progressTimer)
    }
  }, [onComplete])

  const filledBlocks = Math.floor((progress / 100) * 20) // 20 blocks total

  const getPixelShape = (type: string) => {
    switch (type) {
      case "cross":
        return {
          clipPath:
            "polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)",
        }
      case "diamond":
        return {
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }
      case "square":
      default:
        return {}
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${press2p.className}`}
      style={{
        background: `linear-gradient(135deg, 
          ${PIXSELF_BRAND.colors.sky.alice} 0%, 
          ${PIXSELF_BRAND.colors.sky.light} 50%, 
          ${PIXSELF_BRAND.colors.sky.primary} 100%)`,
        imageRendering: "pixelated",
      }}
    >
      {/* 8-bit pixel grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              ${PIXSELF_BRAND.colors.primary.navy} 0px,
              ${PIXSELF_BRAND.colors.primary.navy} 1px,
              transparent 1px,
              transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              ${PIXSELF_BRAND.colors.primary.navy} 0px,
              ${PIXSELF_BRAND.colors.primary.navy} 1px,
              transparent 1px,
              transparent 8px
            )
          `,
        }}
      />

      {/* Animated 8-bit pixel effects */}
      <div className="absolute inset-0 overflow-hidden">
        {pixelEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute animate-pulse"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              width: `${effect.size}px`,
              height: `${effect.size}px`,
              backgroundColor: effect.color,
              animationDelay: `${effect.delay}s`,
              animationDuration: `${effect.duration}s`,
              filter: `drop-shadow(0 0 2px ${effect.color})`,
              imageRendering: "pixelated",
              ...getPixelShape(effect.type),
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated Logo */}
        <div
          className={`transition-all duration-1000 ${
            showLogo ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4"
          }`}
        >
          <div className="relative">
            <PixselfLogo size="xl" showText={false} animated={true} />

            {/* 8-bit style pulsing glow effect */}
            <div
              className="absolute inset-0 animate-pulse opacity-40 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle, ${PIXSELF_BRAND.colors.accent.sparkle}40 0%, transparent 70%),
                  repeating-conic-gradient(from 0deg, ${PIXSELF_BRAND.colors.primary.gold}20 0deg 90deg, transparent 90deg 180deg)
                `,
                filter: "blur(15px)",
                transform: "scale(1.5)",
                imageRendering: "pixelated",
              }}
            />
          </div>
        </div>

        {/* 8-bit Loading Bar */}
        <div
          className={`transition-all duration-500 ${
            showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Progress Bar with 8-bit styling */}
            <div
              className="w-80 h-8 border-4 flex relative overflow-hidden"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: `
                  ${PIXSELF_BRAND.shadows.pixelLarge},
                  inset 2px 2px 0px ${PIXSELF_BRAND.colors.primary.navyLight}
                `,
                imageRendering: "pixelated",
              }}
            >
              {/* 8-bit background pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      ${PIXSELF_BRAND.colors.primary.navyLight} 0px,
                      ${PIXSELF_BRAND.colors.primary.navyLight} 2px,
                      transparent 2px,
                      transparent 4px
                    )
                  `,
                }}
              />

              {/* Background blocks */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r-2 last:border-r-0 relative transition-all duration-200"
                  style={{
                    borderRightColor: PIXSELF_BRAND.colors.primary.navyLight,
                  }}
                >
                  {/* Filled block with 8-bit effect */}
                  {i < filledBlocks && (
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                        boxShadow: `
                          inset 0 0 0 1px ${PIXSELF_BRAND.colors.primary.goldDark},
                          inset 2px 2px 0px ${PIXSELF_BRAND.colors.primary.goldLight}
                        `,
                        imageRendering: "pixelated",
                      }}
                    />
                  )}

                  {/* Partial fill for the current block */}
                  {i === filledBlocks && progress % 5 > 0 && (
                    <div
                      className="absolute inset-0 transition-all duration-100"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                        width: `${((progress % 5) / 5) * 100}%`,
                        opacity: 0.7,
                        imageRendering: "pixelated",
                      }}
                    />
                  )}
                </div>
              ))}

              {/* 8-bit animated shine effect */}
              {progress > 0 && progress < 100 && (
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255,255,255,0.3) 25%,
                        transparent 50%
                      )
                    `,
                    width: `${progress}%`,
                    imageRendering: "pixelated",
                  }}
                />
              )}
            </div>

            {/* 8-bit Percentage Display */}
            <div
              className="text-[16px] font-bold tracking-wider px-4 py-2 border-4"
              style={{
                color: PIXSELF_BRAND.colors.primary.navy,
                backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: `
                  ${PIXSELF_BRAND.shadows.pixel},
                  inset 2px 2px 0px ${PIXSELF_BRAND.colors.cloud.light}
                `,
                textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.gold}`,
                imageRendering: "pixelated",
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* 8-bit Tagline */}
        <div
          className={`transition-all duration-800 ${
            showTagline ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div
            className="text-[14px] sm:text-[16px] font-bold tracking-wider text-center px-6 py-3 border-4"
            style={{
              color: PIXSELF_BRAND.colors.primary.navy,
              backgroundColor: "rgba(240, 248, 255, 0.95)",
              borderColor: PIXSELF_BRAND.colors.primary.gold,
              boxShadow: `
                ${PIXSELF_BRAND.shadows.pixelLarge},
                inset 2px 2px 0px rgba(255,255,255,0.8)
              `,
              textShadow: `3px 3px 0px ${PIXSELF_BRAND.colors.primary.gold}`,
              imageRendering: "pixelated",
            }}
          >
            PIXture yourSELF in PIXSELF city
          </div>
        </div>

        {/* 8-bit Loading dots animation */}
        <div className={`flex space-x-2 transition-all duration-500 ${showLogo ? "opacity-100" : "opacity-0"}`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 animate-bounce border"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
                imageRendering: "pixelated",
                boxShadow: `1px 1px 0px ${PIXSELF_BRAND.colors.primary.navy}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 8-bit corner decorations */}
      <div className="absolute top-4 left-4">
        <div
          className="w-8 h-8 border-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 50%, 50% 50%, 50% 100%, 0% 100%)",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <div className="absolute top-4 right-4">
        <div
          className="w-8 h-8 border-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 50%, 0% 50%)",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <div className="absolute bottom-4 left-4">
        <div
          className="w-8 h-8 border-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            clipPath: "polygon(0% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 100%, 0% 100%)",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <div className="absolute bottom-4 right-4">
        <div
          className="w-8 h-8 border-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 50% 50%)",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  )
}
