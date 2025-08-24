"use client"

import { useEffect, useRef } from "react"
import { CLASSIC_8BIT_COLORS } from "@/config/8bit-theme"

export function RetroPixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawPixelPattern()
    }

    const drawPixelPattern = () => {
      const pixelSize = 4
      const cols = Math.ceil(canvas.width / pixelSize)
      const rows = Math.ceil(canvas.height / pixelSize)

      // Create a classic 8-bit checkerboard pattern with animated elements
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const isEven = (x + y) % 2 === 0
          const noise = Math.random()

          let color: string = CLASSIC_8BIT_COLORS.nes.black

          // Base checkerboard
          if (isEven) {
            color = CLASSIC_8BIT_COLORS.nes.black
          } else {
            color = CLASSIC_8BIT_COLORS.nes.darkGray
          }

          // Add some random pixels for texture
          if (noise > 0.98) {
            color = CLASSIC_8BIT_COLORS.nes.gray
          } else if (noise > 0.995) {
            color = CLASSIC_8BIT_COLORS.nes.darkBlue
          }

          ctx.fillStyle = color
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      }

      // Add some animated "stars" or pixels
      const time = Date.now() * 0.001
      for (let i = 0; i < 50; i++) {
        const x = Math.floor((Math.sin(time + i) * 0.5 + 0.5) * cols) * pixelSize
        const y = Math.floor((Math.cos(time * 0.7 + i) * 0.5 + 0.5) * rows) * pixelSize

        ctx.fillStyle = Math.sin(time + i) > 0.8 ? (CLASSIC_8BIT_COLORS.nes.lightBlue as string) : (CLASSIC_8BIT_COLORS.nes.cyan as string)
        ctx.fillRect(x, y, pixelSize, pixelSize)
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animate the background
    const animate = () => {
      drawPixelPattern()
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ imageRendering: "pixelated" }} />
}
