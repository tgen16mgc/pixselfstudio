"use client"
import { useEffect, useState } from "react"

export function FantasyBackground() {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Preload the image to check if it exists
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageLoaded(false)
    img.src = "/images/cozy-room-bg.gif"
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Cozy room animated GIF background */}
      {imageLoaded ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: "url('/images/cozy-room-bg.gif')",
          }}
        />
      ) : (
        // Fallback sage green gradient background matching the provided image
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, 
              #C8D5C8 0%, 
              #B8C8B8 25%, 
              #A8BBA8 50%, 
              #98AE98 75%, 
              #88A188 100%)`,
          }}
        />
      )}

      {/* Enhanced overlay with sage green tones for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-green-800/40 to-green-900/35" />

      {/* Subtle sage green themed animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 animate-pulse"
            style={{
              backgroundColor:
                i % 4 === 0
                  ? "#7BA05B" // Sage green
                  : i % 4 === 1
                    ? "#9BC53D" // Lime green
                    : i % 4 === 2
                      ? "#E6B800" // Golden yellow
                      : "#6B8E23", // Olive green
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Sage green themed grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(#7BA05B44 1px, transparent 1px),
            linear-gradient(90deg, #7BA05B44 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}
