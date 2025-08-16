"use client"

import { useEffect, useState } from "react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"

export function PixselfBackground() {
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      duration: number
    }>
  >([])

  useEffect(() => {
    // Generate fewer, more subtle animated sparkles to complement the background image
    const newSparkles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 4,
      duration: Math.random() * 4 + 3,
    }))
    setSparkles(newSparkles)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/coverr-background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

      {/* Additional animated sparkles (subtle) */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute animate-pulse opacity-60"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
              filter: `drop-shadow(0 0 3px ${PIXSELF_BRAND.colors.accent.star})`,
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(5px) translateY(-3px); }
          50% { transform: translateX(-3px) translateY(-5px); }
          75% { transform: translateX(-5px) translateY(3px); }
        }
      `}</style>
    </div>
  )
}
