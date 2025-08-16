"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  ChevronRight,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Share2,
  Palette,
  Layers,
  Settings,
  Undo2,
  Redo2,
  Grid,
  Save,
} from "lucide-react"
import { Press_Start_2P } from "next/font/google"

// Import Pixself brand components
import { PixselfBackground } from "@/components/pixself-background"
import { PixselfButton, PixselfPanel, PixselfColorSwatch } from "@/components/pixself-ui-components"
import { LoadingScreen } from "@/components/loading-screen"
import { DownloadConfirmationModal } from "@/components/download-confirmation-modal"
import { ShareTemplateModal } from "@/components/share-template-modal"
import { CharacterGalleryModal } from "@/components/character-gallery-modal"
import { EnhancedTitleSection } from "@/components/enhanced-title-section"
import { PromotionBanner } from "@/components/promotion-banner"
import { EnhancedVariantGrid } from "@/components/enhanced-variant-grid"
import { RETRO_CHARACTER_PALETTES } from "@/config/8bit-theme"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { isStorageAvailable } from "@/utils/character-storage"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

// Types - Updated to remove shoes
type PartKey = "hair" | "head" | "eyes" | "eyebrows" | "mouth" | "body" | "costume"
type Selections = Record<PartKey, { variant: number; color: number }>

interface HistoryState {
  selections: Selections
  timestamp: number
}

// Updated parts configuration - removed shoes
const PIXSELF_PARTS: { key: PartKey; label: string; icon: string; category: string }[] = [
  { key: "hair", label: "HAIR", icon: "▓▓▓", category: "HEAD" },
  { key: "head", label: "HEAD", icon: "███", category: "HEAD" },
  { key: "eyes", label: "EYES", icon: "● ●", category: "FACE" },
  { key: "eyebrows", label: "BROWS", icon: "▬ ▬", category: "FACE" },
  { key: "mouth", label: "MOUTH", icon: " ▬ ", category: "FACE" },
  { key: "body", label: "BODY", icon: "███", category: "BODY" },
  { key: "costume", label: "OUTFIT", icon: "▓█▓", category: "BODY" },
]

// Default selections - updated to remove shoes
function defaultSelections(): Selections {
  return {
    hair: { variant: 2, color: 0 },
    head: { variant: 1, color: 0 },
    eyes: { variant: 2, color: 0 },
    eyebrows: { variant: 2, color: 0 },
    mouth: { variant: 2, color: 0 },
    body: { variant: 3, color: 0 },
    costume: { variant: 1, color: 0 },
  }
}

// 8-bit sound effects
const play8BitSound = (type: "click" | "select" | "success" | "error", enabled: boolean) => {
  if (!enabled) return

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "click":
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        break
      case "select":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        break
      case "success":
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        break
      case "error":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        break
    }

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch {
    console.log("Audio not supported")
  }
}

// Complete character drawing function - updated to remove shoes
function drawCharacterToCanvas(canvas: HTMLCanvasElement, sel: Selections, scale = 6) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  canvas.width = 64 * scale
  canvas.height = 80 * scale

  // Ensure pixel-perfect rendering
  ctx.imageSmoothingEnabled = false

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw shadow
  ctx.globalAlpha = 0.3
  const cx = 64 / 2
  ctx.fillStyle = "#000000"
  const pixelRadius = Math.floor(16 * scale)
  const centerX = Math.floor(cx * scale)
  const centerY = Math.floor(74 * scale)

  for (let x = -pixelRadius; x <= pixelRadius; x++) {
    for (let y = -pixelRadius; y <= pixelRadius; y++) {
      if (x * x + y * y <= pixelRadius * pixelRadius) {
        ctx.fillRect(centerX + x, centerY + y, 1, 1)
      }
    }
  }
  ctx.globalAlpha = 1

  // Layer order for proper rendering - removed shoes
  const LAYER_ORDER: PartKey[] = ["body", "head", "hair", "eyebrows", "eyes", "mouth", "costume"]

  // Draw each part in order
  for (const part of LAYER_ORDER) {
    const { variant, color: cIdx } = sel[part]
    const color = RETRO_CHARACTER_PALETTES[part][cIdx]

    switch (part) {
      case "head":
        drawHead(ctx, variant, color, scale)
        break
      case "hair":
        drawHair(ctx, variant, color, scale)
        break
      case "eyes":
        drawEyes(ctx, variant, color, scale)
        break
      case "eyebrows":
        drawBrows(ctx, variant, color, scale)
        break
      case "mouth":
        drawMouth(ctx, variant, color, scale)
        break
      case "body":
        drawBody(ctx, variant, color, scale)
        break
      case "costume":
        drawCostume(ctx, variant, color, scale)
        break
    }
  }
}

// Helper functions for character drawing
function pixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  u: number,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x * u), Math.floor(y * u), Math.floor(w * u), Math.floor(h * u))
}

function pixelCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, u: number) {
  ctx.fillStyle = color
  const pixelRadius = Math.floor(r * u)
  const centerX = Math.floor(cx * u)
  const centerY = Math.floor(cy * u)

  for (let x = -pixelRadius; x <= pixelRadius; x++) {
    for (let y = -pixelRadius; y <= pixelRadius; y++) {
      if (x * x + y * y <= pixelRadius * pixelRadius) {
        ctx.fillRect(centerX + x, centerY + y, 1, 1)
      }
    }
  }
}

// All the drawing functions (drawHead, drawHair, etc.)
function drawHead(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const v = variant % 10
  if (v < 3) pixelCircle(ctx, cx, 36, 16, color, u)
  else if (v < 6) pixelRect(ctx, cx - 15, 24, 30, 26, color, u)
  else if (v < 8) pixelRect(ctx, cx - 15, 24, 30, 28, color, u)
  else pixelRect(ctx, cx - 14, 22, 28, 30, color, u)
  if (v % 2 === 1) {
    pixelCircle(ctx, cx - 18, 36, 4, color, u)
    pixelCircle(ctx, cx + 18, 36, 4, color, u)
  }
}

function drawHair(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const v = variant % 10
  switch (v) {
    case 0:
      return
    case 1:
      pixelRect(ctx, cx - 16, 20, 32, 10, color, u)
      break
    case 2:
      pixelRect(ctx, cx - 18, 18, 36, 12, color, u)
      pixelRect(ctx, cx - 18, 25, 18, 7, color, u)
      break
    case 3:
      pixelRect(ctx, cx - 16, 18, 32, 12, color, u)
      pixelCircle(ctx, cx, 14, 6, color, u)
      break
    case 4:
      pixelRect(ctx, cx - 18, 18, 36, 12, color, u)
      pixelCircle(ctx, cx - 20, 24, 6, color, u)
      pixelCircle(ctx, cx + 20, 24, 6, color, u)
      break
    case 5:
      pixelRect(ctx, cx - 18, 18, 36, 12, color, u)
      pixelRect(ctx, cx - 18, 28, 36, 16, color, u)
      break
    case 6:
      for (let i = -16; i <= 16; i += 8) pixelRect(ctx, cx + i, 16, 6, 10, color, u)
      break
    case 7:
      pixelRect(ctx, cx - 2, 14, 4, 18, color, u)
      break
    case 8:
      pixelRect(ctx, cx - 18, 18, 36, 18, color, u)
      break
    case 9:
      pixelRect(ctx, cx - 19, 20, 38, 10, color, u)
      pixelRect(ctx, cx - 22, 28, 44, 4, color, u)
      break
  }
}

function drawEyes(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const y = 36
  const v = variant % 10
  const dx = v % 2 === 0 ? 8 : 10
  if (v < 3) {
    pixelCircle(ctx, cx - dx, y, 2, color, u)
    pixelCircle(ctx, cx + dx, y, 2, color, u)
  } else if (v < 6) {
    pixelRect(ctx, cx - dx - 2, y - 2, 4, 4, color, u)
    pixelRect(ctx, cx + dx - 2, y - 2, 4, 4, color, u)
  } else if (v < 8) {
    pixelRect(ctx, cx - dx - 3, y - 2, 6, 4, color, u)
    pixelRect(ctx, cx + dx - 3, y - 2, 6, 4, color, u)
  } else {
    pixelRect(ctx, cx - dx - 3, y - 1, 6, 2, color, u)
    pixelRect(ctx, cx + dx - 3, y - 1, 6, 2, color, u)
  }
}

function drawBrows(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const y = 30
  const v = variant % 10
  const dx = 10
  if (v < 3) {
    pixelRect(ctx, cx - dx - 4, y, 8, 2, color, u)
    pixelRect(ctx, cx + dx - 4, y, 8, 2, color, u)
  } else if (v < 6) {
    pixelRect(ctx, cx - dx - 4, y, 8, 2, color, u)
    pixelRect(ctx, cx + dx - 4, y + 1, 8, 2, color, u)
  } else if (v < 8) {
    pixelRect(ctx, cx - dx - 5, y - 1, 10, 3, color, u)
    pixelRect(ctx, cx + dx - 5, y - 1, 10, 3, color, u)
  } else {
    pixelRect(ctx, cx - dx - 4, y - 3, 8, 2, color, u)
    pixelRect(ctx, cx + dx - 4, y - 3, 8, 2, color, u)
  }
}

function drawMouth(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const y = 46
  const v = variant % 10
  if (v < 3) pixelCircle(ctx, cx, y, 1.5, color, u)
  else if (v < 6) pixelRect(ctx, cx - 6, y, 12, 2, color, u)
  else if (v < 8) pixelRect(ctx, cx - 5, y - 1, 10, 4, color, u)
  else pixelRect(ctx, cx - 6, y + 1, 12, 2, color, u)
}

function drawBody(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const v = variant % 10
  if (v < 3) pixelRect(ctx, cx - 18, 50, 36, 18, color, u)
  else if (v < 6) pixelRect(ctx, cx - 20, 50, 40, 18, color, u)
  else if (v < 8) pixelRect(ctx, cx - 16, 50, 32, 20, color, u)
  else pixelRect(ctx, cx - 22, 50, 44, 18, color, u)
  pixelRect(ctx, cx - 24, 56, 6, 6, color, u)
  pixelRect(ctx, cx + 18, 56, 6, 6, color, u)
}

function drawCostume(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = 64 / 2
  const v = variant % 10
  if (v === 0) return
  pixelRect(ctx, cx - 18, 52, 36, 14, color, u)
  if (v < 3) pixelRect(ctx, cx - 16, 58, 32, 2, "#FFFFFF", u)
  else if (v < 6) pixelRect(ctx, cx + 6, 56, 8, 6, "#FFFFFF", u)
  else if (v < 8) {
    pixelCircle(ctx, cx, 56, 1.2, "#FFFFFF", u)
    pixelCircle(ctx, cx, 60, 1.2, "#FFFFFF", u)
  } else {
    pixelRect(ctx, cx - 6, 56, 12, 6, "#FFFFFF", u)
  }
}

// Canvas preview component
function PixelCanvasPreview({
  selections,
  scale = 6,
  zoom = 1,
}: { selections: Selections; scale?: number; zoom?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationOffset, setAnimationOffset] = useState(0)

  useEffect(() => {
    const animate = () => {
      setAnimationOffset((prev) => (prev + 0.01) % (Math.PI * 2))
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current

    canvas.width = 64 * scale * zoom
    canvas.height = 80 * scale * zoom

    const ctx = canvas.getContext("2d")!
    ctx.save()

    // Apply subtle floating animation
    const floatY = Math.sin(animationOffset) * 1
    ctx.translate(0, floatY * scale * zoom)

    // Draw the actual character
    drawCharacterToCanvas(canvas, selections, scale * zoom)

    ctx.restore()
  }, [selections, scale, zoom, animationOffset])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-auto max-w-full"
      style={{ imageRendering: "pixelated" }}
      aria-label="8-bit pixel character preview"
    />
  )
}

// Character Frame
function PixselfCharacterFrame({ children, zoom = 1 }: { children: React.ReactNode; zoom?: number }) {
  return (
    <div
      className="relative mx-auto aspect-[64/80] w-full max-w-[500px] border-4 overflow-hidden backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(240, 248, 255, 0.85)", // Alice blue with transparency
        borderColor: PIXSELF_BRAND.colors.primary.navy,
        boxShadow: PIXSELF_BRAND.shadows.glowStrong,
      }}
    >
      <div
        className="absolute inset-2 opacity-20"
        style={{
          backgroundImage: `
      repeating-linear-gradient(
        0deg,
        ${PIXSELF_BRAND.colors.primary.gold}80 0px,
        ${PIXSELF_BRAND.colors.primary.gold}80 2px,
        transparent 2px,
        transparent 4px
      ),
      repeating-linear-gradient(
        90deg,
        ${PIXSELF_BRAND.colors.primary.gold}80 0px,
        ${PIXSELF_BRAND.colors.primary.gold}80 2px,
        transparent 2px,
        transparent 4px
      )
    `,
        }}
      />
      <div className="absolute inset-4 grid place-items-center overflow-hidden">
        <div style={{ transform: `scale(${zoom})` }}>{children}</div>
      </div>
    </div>
  )
}

// Responsive hook
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const handler = () => setIsDesktop(media.matches)
    handler()
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

// Mobile Variant Preview Component - updated to remove shoes
function MobileVariantPreview({ part, variant, color }: { part: string; variant: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!

    canvas.width = 48
    canvas.height = 48
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, 48, 48)

    // Draw a simple preview based on the part type
    const scale = 1

    switch (part) {
      case "hair":
        drawHairPreview(ctx, variant, color, scale)
        break
      case "head":
        drawHeadPreview(ctx, variant, color, scale)
        break
      case "eyes":
        drawEyesPreview(ctx, variant, color, scale)
        break
      case "eyebrows":
        drawBrowsPreview(ctx, variant, color, scale)
        break
      case "mouth":
        drawMouthPreview(ctx, variant, color, scale)
        break
      case "body":
        drawBodyPreview(ctx, variant, color, scale)
        break
      case "costume":
        drawCostumePreview(ctx, variant, color, scale)
        break
      default:
        // Fallback: simple rectangle
        ctx.fillStyle = color
        ctx.fillRect(16, 16, 16, 16)
        break
    }
  }, [part, variant, color])

  return <canvas ref={canvasRef} className="absolute inset-1" style={{ imageRendering: "pixelated" }} />
}

// Preview drawing functions for mobile
function drawHairPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24
  const v = variant % 10
  switch (v) {
    case 0:
      return
    case 1:
      pixelRect(ctx, cx - 12, 8, 24, 8, color, scale)
      break
    case 2:
      pixelRect(ctx, cx - 14, 6, 28, 10, color, scale)
      pixelRect(ctx, cx - 14, 12, 14, 6, color, scale)
      break
    case 3:
      pixelRect(ctx, cx - 12, 6, 24, 10, color, scale)
      pixelCircle(ctx, cx, 4, 4, color, scale)
      break
    case 4:
      pixelRect(ctx, cx - 14, 6, 28, 10, color, scale)
      pixelCircle(ctx, cx - 16, 12, 4, color, scale)
      pixelCircle(ctx, cx + 16, 12, 4, color, scale)
      break
    case 5:
      pixelRect(ctx, cx - 14, 6, 28, 10, color, scale)
      pixelRect(ctx, cx - 14, 14, 28, 12, color, scale)
      break
    case 6:
      for (let i = -12; i <= 12; i += 6) pixelRect(ctx, cx + i, 6, 4, 8, color, scale)
      break
    case 7:
      pixelRect(ctx, cx - 2, 4, 4, 14, color, scale)
      break
    case 8:
      pixelRect(ctx, cx - 14, 6, 28, 14, color, scale)
      break
    case 9:
      pixelRect(ctx, cx - 15, 8, 30, 8, color, scale)
      pixelRect(ctx, cx - 17, 14, 34, 4, color, scale)
      break
  }
}

function drawHeadPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24
  const v = variant % 10
  if (v < 3) pixelCircle(ctx, cx, 24, 12, color, scale)
  else if (v < 6) pixelRect(ctx, cx - 11, 12, 22, 20, color, scale)
  else if (v < 8) pixelRect(ctx, cx - 11, 12, 22, 22, color, scale)
  else pixelRect(ctx, cx - 10, 10, 20, 24, color, scale)
  if (v % 2 === 1) {
    pixelCircle(ctx, cx - 14, 24, 3, color, scale)
    pixelCircle(ctx, cx + 14, 24, 3, color, scale)
  }
}

function drawEyesPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24,
    y = 24,
    v = variant % 10,
    dx = v % 2 === 0 ? 6 : 8
  if (v < 3) {
    pixelCircle(ctx, cx - dx, y, 2, color, scale)
    pixelCircle(ctx, cx + dx, y, 2, color, scale)
  } else if (v < 6) {
    pixelRect(ctx, cx - dx - 2, y - 2, 4, 4, color, scale)
    pixelRect(ctx, cx + dx - 2, y - 2, 4, 4, color, scale)
  } else if (v < 8) {
    pixelRect(ctx, cx - dx - 3, y - 2, 6, 4, color, scale)
    pixelRect(ctx, cx + dx - 3, y - 2, 6, 4, color, scale)
  } else {
    pixelRect(ctx, cx - dx - 3, y - 1, 6, 2, color, scale)
    pixelRect(ctx, cx + dx - 3, y - 1, 6, 2, color, scale)
  }
}

function drawBrowsPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24,
    y = 18,
    v = variant % 10,
    dx = 8
  if (v < 3) {
    pixelRect(ctx, cx - dx - 3, y, 6, 2, color, scale)
    pixelRect(ctx, cx + dx - 3, y, 6, 2, color, scale)
  } else if (v < 6) {
    pixelRect(ctx, cx - dx - 3, y, 6, 2, color, scale)
    pixelRect(ctx, cx + dx - 3, y + 1, 6, 2, color, scale)
  } else if (v < 8) {
    pixelRect(ctx, cx - dx - 4, y - 1, 8, 3, color, scale)
    pixelRect(ctx, cx + dx - 4, y - 1, 8, 3, color, scale)
  } else {
    pixelRect(ctx, cx - dx - 3, y - 2, 6, 2, color, scale)
    pixelRect(ctx, cx + dx - 3, y - 2, 6, 2, color, scale)
  }
}

function drawMouthPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24,
    y = 30,
    v = variant % 10
  if (v < 3) pixelCircle(ctx, cx, y, 1.5, color, scale)
  else if (v < 6) pixelRect(ctx, cx - 4, y, 8, 2, color, scale)
  else if (v < 8) pixelRect(ctx, cx - 4, y - 1, 8, 3, color, scale)
  else pixelRect(ctx, cx - 4, y + 1, 8, 2, color, scale)
}

function drawBodyPreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24,
    v = variant % 10
  if (v < 3) pixelRect(ctx, cx - 14, 20, 28, 14, color, scale)
  else if (v < 6) pixelRect(ctx, cx - 15, 20, 30, 14, color, scale)
  else if (v < 8) pixelRect(ctx, cx - 12, 20, 24, 16, color, scale)
  else pixelRect(ctx, cx - 17, 20, 34, 14, color, scale)
  pixelRect(ctx, cx - 18, 24, 4, 4, color, scale)
  pixelRect(ctx, cx + 14, 24, 4, 4, color, scale)
}

function drawCostumePreview(ctx: CanvasRenderingContext2D, variant: number, color: string, scale: number) {
  const cx = 24
  const v = variant % 10
  if (v === 0) return
  pixelRect(ctx, cx - 14, 22, 28, 11, color, scale)
  if (v < 3) pixelRect(ctx, cx - 12, 26, 24, 2, "#FFFFFF", scale)
  else if (v < 6) pixelRect(ctx, cx + 4, 24, 6, 4, "#FFFFFF", scale)
  else if (v < 8) {
    pixelCircle(ctx, cx, 24, 1, "#FFFFFF", scale)
    pixelCircle(ctx, cx, 28, 1, "#FFFFFF", scale)
  } else pixelRect(ctx, cx - 4, 24, 8, 4, "#FFFFFF", scale)
}

// Main component
export default function Page() {
  const isDesktop = useIsDesktop()
  const [isLoading, setIsLoading] = useState(true)
  const [selections, setSelections] = useState<Selections>(defaultSelections)
  const [activePart, setActivePart] = useState<PartKey>("hair")
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [shareLoading] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [downloadModalData, setDownloadModalData] = useState<{
    preview: string
    fileName: string
    fileSize: string
    scale: number
  } | null>(null)
  const [sharePreviewData, setSharePreviewData] = useState<string>("")
  const [storageAvailable, setStorageAvailable] = useState(false)

  // Check storage availability on mount
  useEffect(() => {
    setStorageAvailable(isStorageAvailable())
  }, [])

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      const initialState: HistoryState = {
        selections: selections,
        timestamp: Date.now(),
      }
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [history.length, selections])

  // Add to history when selections change
  const addToHistory = useCallback(
    (newSelections: Selections) => {
      const newState: HistoryState = {
        selections: newSelections,
        timestamp: Date.now(),
      }

      setHistory((prev) => {
        const newHistory = [...prev.slice(0, historyIndex + 1), newState]
        return newHistory.slice(-50)
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setSelections(history[newIndex].selections)
      play8BitSound("click", soundEnabled)
    }
  }, [historyIndex, history, soundEnabled, setSelections])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setSelections(history[newIndex].selections)
      play8BitSound("click", soundEnabled)
    }
  }, [historyIndex, history, soundEnabled, setSelections])

  // Show download confirmation modal
  const showDownloadConfirmation = useCallback((scale = 12) => {
    try {
      // Create a temporary canvas for preview
      const previewCanvas = document.createElement("canvas")
      const previewCtx = previewCanvas.getContext("2d")

      if (!previewCtx) {
        throw new Error("Could not create canvas context")
      }

      // Set canvas size for preview (smaller for modal)
      const previewScale = 8
      previewCanvas.width = 64 * previewScale
      previewCanvas.height = 80 * previewScale
      previewCtx.imageSmoothingEnabled = false

      // Draw the character to the preview canvas
      drawCharacterToCanvas(previewCanvas, selections, previewScale)

      // Get preview as base64
      const previewDataUrl = previewCanvas.toDataURL("image/png")

      // Calculate file info
      const width = 64 * scale
      const height = 80 * scale
      const sizeLabel = scale === 6 ? "small" : scale === 12 ? "medium" : "large"
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
      const fileName = `pixself-character-${sizeLabel}-${timestamp}.png`
      const estimatedSize = Math.round((width * height * 4) / 1024) // Rough estimate in KB
      const fileSize = estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} MB` : `${estimatedSize} KB`

      setDownloadModalData({
        preview: previewDataUrl,
        fileName,
        fileSize,
        scale,
      })
      setShowDownloadModal(true)
    } catch (error) {
      console.error("Preview generation failed:", error)
      play8BitSound("error", soundEnabled)
      alert("Preview generation failed. Please try again.")
    }
  }, [selections, soundEnabled, setDownloadModalData, setShowDownloadModal])

  const randomize = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const newSelections = { ...selections }
      ;(Object.keys(newSelections) as PartKey[]).forEach((p) => {
        newSelections[p] = {
          variant: Math.floor(Math.random() * 10),
          color: Math.floor(Math.random() * RETRO_CHARACTER_PALETTES[p].length),
        }
      })
      setSelections(newSelections)
      addToHistory(newSelections)
      setLoading(false)
      play8BitSound("success", soundEnabled)
    }, 100)
  }, [selections, addToHistory, soundEnabled, setLoading, setSelections])

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
        } else if (e.key === "s") {
          e.preventDefault()
          showDownloadConfirmation()
        } else if (e.key === " ") {
          e.preventDefault()
          randomize()
        } else if (e.key === "g") {
          e.preventDefault()
          if (storageAvailable) setShowGalleryModal(true)
        }
      } else if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        randomize()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [historyIndex, history, soundEnabled, storageAvailable, undo, redo, showDownloadConfirmation, randomize])

  function onSelectVariant(part: PartKey, variant: number) {
    setLoading(true)
    setTimeout(() => {
      const newSelections = { ...selections, [part]: { ...selections[part], variant } }
      setSelections(newSelections)
      addToHistory(newSelections)
      setLoading(false)
      play8BitSound("select", soundEnabled)
    }, 50)
  }

  function onSelectColor(part: PartKey, color: number) {
    const newSelections = { ...selections, [part]: { ...selections[part], color } }
    setSelections(newSelections)
    addToHistory(newSelections)
    play8BitSound("click", soundEnabled)
  }

  function resetAll() {
    const newSelections = defaultSelections()
    setSelections(newSelections)
    addToHistory(newSelections)
    play8BitSound("click", soundEnabled)
  }

  // Generate thumbnail for saving
  const generateThumbnail = useCallback((selections: Selections): string => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return ""

    canvas.width = 64 * 4
    canvas.height = 80 * 4
    ctx.imageSmoothingEnabled = false

    drawCharacterToCanvas(canvas, selections, 4)

    return canvas.toDataURL("image/png")
  }, [])

  // Handle loading character from gallery
  const handleLoadCharacter = useCallback(
    (newSelections: Selections) => {
      setSelections(newSelections)
      addToHistory(newSelections)
      play8BitSound("success", soundEnabled)
    },
    [addToHistory, soundEnabled],
  )

  // Handle saving character
  const handleSaveCharacter = useCallback(
    () => {
      play8BitSound("success", soundEnabled)
    },
    [soundEnabled],
  )


  // Actual download function that creates and saves a PNG
  function downloadPng() {
    if (!downloadModalData) return

    setDownloadLoading(true)

    try {
      // Create a temporary canvas for export
      const exportCanvas = document.createElement("canvas")
      const exportCtx = exportCanvas.getContext("2d")

      if (!exportCtx) {
        throw new Error("Could not create canvas context")
      }

      // Set canvas size based on scale
      const width = 64 * downloadModalData.scale
      const height = 80 * downloadModalData.scale
      exportCanvas.width = width
      exportCanvas.height = height

      // Ensure pixel-perfect rendering
      exportCtx.imageSmoothingEnabled = false

      // Draw the character to the export canvas
      drawCharacterToCanvas(exportCanvas, selections, downloadModalData.scale)

      // Convert canvas to blob and download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Could not create image blob")
        }

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = downloadModalData.fileName

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)

        setDownloadLoading(false)
        setShowDownloadModal(false)
        setDownloadModalData(null)
        play8BitSound("success", soundEnabled)
      }, "image/png")
    } catch (error) {
      console.error("Download failed:", error)
      setDownloadLoading(false)
      play8BitSound("error", soundEnabled)
      alert("Download failed. Please try again.")
    }
  }

  function shareCharacter() {
    try {
      // Create a temporary canvas for sharing preview
      const shareCanvas = document.createElement("canvas")
      const shareCtx = shareCanvas.getContext("2d")

      if (!shareCtx) {
        play8BitSound("error", soundEnabled)
        alert("Could not create share preview")
        return
      }

      // Set canvas size for sharing (medium size for preview)
      shareCanvas.width = 64 * 8
      shareCanvas.height = 80 * 8
      shareCtx.imageSmoothingEnabled = false

      // Draw the character
      drawCharacterToCanvas(shareCanvas, selections, 8)

      // Get preview as base64
      const previewDataUrl = shareCanvas.toDataURL("image/png")
      setSharePreviewData(previewDataUrl)
      setShowShareModal(true)
      play8BitSound("click", soundEnabled)
    } catch (error) {
      console.error("Share preview generation failed:", error)
      play8BitSound("error", soundEnabled)
      alert("Share preview generation failed. Please try again.")
    }
  }

  // Group parts by category
  const partsByCategory = PIXSELF_PARTS.reduce(
    (acc, part) => {
      if (!acc[part.category]) acc[part.category] = []
      acc[part.category].push(part)
      return acc
    },
    {} as Record<string, typeof PIXSELF_PARTS>,
  )

  // Color names for accessibility - updated to remove shoes
  const colorNames = {
    hair: ["Midnight", "Chestnut", "Auburn", "Sandy", "Platinum", "Mystic"],
    head: ["Fair", "Light", "Medium", "Olive", "Deep", "Dark"],
    eyes: ["Brown", "Blue", "Green", "Gray", "Purple", "Red"],
    eyebrows: ["Black", "Brown", "Blonde", "Gray", "Dark Red", "Purple"],
    mouth: ["Dark Red", "Red", "Muted Red", "Orange", "Pink", "Purple"],
    body: ["Fair", "Light", "Medium", "Olive", "Deep", "Dark"],
    costume: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
  }

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <main className={`min-h-screen ${press2p.className} relative`}>
      <PixselfBackground />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 lg:py-8">
        {/* Enhanced Header */}
        <header className="mb-6">
          <EnhancedTitleSection
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onUndo={undo}
            onRedo={redo}
            onReset={resetAll}
            onRandomize={randomize}
            onShare={shareCharacter}
            onDownload={() => showDownloadConfirmation()}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            isLoading={loading}
            isDownloadLoading={downloadLoading}
            isDesktop={isDesktop}
          />
        </header>

        {/* Promotion Banner */}
        <div className="mb-8">
          <PromotionBanner
            message="🎮 NO ACTIVE PROMOTIONS • STAY TUNED FOR AMAZING DEALS • FOLLOW US FOR UPDATES 🎮"
            isActive={false}
          />
        </div>

        {isDesktop ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Parts Navigation */}
            <div className="col-span-3 space-y-6">
              <PixselfPanel title="CHARACTER PARTS" icon={<Layers className="h-4 w-4" />}>
                {Object.entries(partsByCategory).map(([category, parts]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        {category}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {parts.map((p) => {
                        const active = activePart === p.key
                        return (
                          <button
                            key={p.key}
                            onClick={() => {
                              setActivePart(p.key)
                              play8BitSound("click", soundEnabled)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-4 backdrop-blur-sm ${
                              active
                                ? "active:translate-x-1 active:translate-y-1"
                                : "hover:translate-x-0.5 hover:translate-y-0.5"
                            }`}
                            style={{
                              backgroundColor: active
                                ? PIXSELF_BRAND.colors.primary.gold
                                : PIXSELF_BRAND.colors.cloud.light,
                              color: PIXSELF_BRAND.colors.primary.navy,
                              borderColor: active
                                ? PIXSELF_BRAND.colors.primary.navy
                                : PIXSELF_BRAND.colors.primary.navyLight,
                              boxShadow: active ? PIXSELF_BRAND.shadows.pixelLarge : PIXSELF_BRAND.shadows.pixel,
                            }}
                          >
                            <span className="text-[8px] font-mono leading-none">{p.icon}</span>
                            <span className="text-[10px] tracking-wide font-bold flex-1">{p.label}</span>
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-all duration-200 ${
                                active ? "opacity-100 translate-x-1" : "opacity-0"
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </PixselfPanel>

              {/* Gallery Panel */}
              {storageAvailable && (
                <PixselfPanel title="CHARACTER GALLERY" icon={<Grid className="h-4 w-4" />}>
                  <div className="space-y-4">
                    <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      Save and manage your characters:
                    </div>
                    <PixselfButton
                      onClick={() => setShowGalleryModal(true)}
                      variant="accent"
                      size="sm"
                      fullWidth
                      icon={<Grid className="h-3.5 w-3.5" />}
                    >
                      OPEN GALLERY
                    </PixselfButton>
                    <div className="text-[8px] text-center" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                      Ctrl+G to open gallery
                    </div>
                  </div>
                </PixselfPanel>
              )}
            </div>

            {/* Center - Preview */}
            <div className="col-span-6">
              <PixselfPanel title="LIVE PREVIEW" variant="primary">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        ZOOM CONTROLS
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                          disabled={zoom <= 0.5}
                          className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 backdrop-blur-sm"
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.primary.navy,
                          }}
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className="text-[9px] min-w-[4ch] text-center font-bold"
                          style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                        >
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                          disabled={zoom >= 2}
                          className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 backdrop-blur-sm"
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.primary.navy,
                          }}
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <PixselfCharacterFrame zoom={zoom}>
                    <PixelCanvasPreview selections={selections} scale={6} zoom={1} />
                  </PixselfCharacterFrame>

                  {/* Action Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <PixselfButton
                        onClick={randomize}
                        disabled={loading}
                        loading={loading}
                        icon={<RefreshCw className="h-4 w-4" />}
                      >
                        RANDOMIZE
                      </PixselfButton>
                      <PixselfButton
                        onClick={() => showDownloadConfirmation()}
                        disabled={downloadLoading}
                        loading={downloadLoading}
                        variant="accent"
                        icon={<Download className="h-4 w-4" />}
                      >
                        DOWNLOAD
                      </PixselfButton>
                      {storageAvailable && (
                        <PixselfButton
                          onClick={() => setShowGalleryModal(true)}
                          variant="secondary"
                          icon={<Save className="h-4 w-4" />}
                        >
                          SAVE
                        </PixselfButton>
                      )}
                    </div>
                  </div>
                </div>
              </PixselfPanel>
            </div>

            {/* Right Sidebar - Customization */}
            <div className="col-span-3 space-y-6">
              <PixselfPanel
                title={`CUSTOMIZE ${PIXSELF_PARTS.find((p) => p.key === activePart)?.label}`}
                icon={<Settings className="h-4 w-4" />}
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        COLOR PALETTE
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {RETRO_CHARACTER_PALETTES[activePart].map((color, i) => (
                        <PixselfColorSwatch
                          key={i}
                          color={color}
                          colorName={colorNames[activePart]?.[i]}
                          selected={selections[activePart].color === i}
                          onClick={() => onSelectColor(activePart, i)}
                          size="md"
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        STYLE VARIANTS
                      </div>
                    </div>
                    <EnhancedVariantGrid
                      activePart={activePart}
                      currentVariant={selections[activePart].variant}
                      currentColor={selections[activePart].color}
                      onVariantSelect={(variant) => onSelectVariant(activePart, variant)}
                      isLoading={loading}
                    />
                  </div>
                </div>
              </PixselfPanel>

              <PixselfPanel title="EXPORT OPTIONS">
                <div className="space-y-4">
                  <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    Choose your export size:
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(6)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      SMALL (384×480)
                    </PixselfButton>
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(12)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      MEDIUM (768×960)
                    </PixselfButton>
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(24)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      LARGE (1536×1920)
                    </PixselfButton>
                  </div>
                  <div className="pt-3 border-t-4" style={{ borderTopColor: PIXSELF_BRAND.colors.primary.navy }}>
                    <PixselfButton
                      onClick={shareCharacter}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Share2 className="h-3.5 w-3.5" />}
                    >
                      SHARE CHARACTER
                    </PixselfButton>
                  </div>
                </div>
              </PixselfPanel>
            </div>
          </div>
        ) : (
          // Mobile Layout
          <div className="space-y-6">
            {/* Mobile Preview */}
            <PixselfPanel title="LIVE PREVIEW" variant="primary">
              <div className="space-y-3">
                {/* Compact Mobile Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="text-[8px] font-bold tracking-wider"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      ZOOM:
                    </div>
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                      disabled={zoom <= 0.5}
                      className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                    >
                      <ZoomOut className="h-2.5 w-2.5" />
                    </button>
                    <span
                      className="text-[7px] min-w-[3ch] text-center font-bold"
                      style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                    >
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                      disabled={zoom >= 2}
                      className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                    >
                      <ZoomIn className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                      title="Undo"
                    >
                      <Undo2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                      title="Redo"
                    >
                      <Redo2 className="h-2.5 w-2.5" />
                    </button>
                    {storageAvailable && (
                      <button
                        onClick={() => setShowGalleryModal(true)}
                        className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200"
                        style={{
                          backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                          color: PIXSELF_BRAND.colors.primary.navy,
                        }}
                        title="Gallery"
                      >
                        <Grid className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact Character Frame */}
                <div className="flex justify-center">
                  <div
                    className="relative border-4 overflow-hidden backdrop-blur-sm"
                    style={{
                      backgroundColor: "rgba(240, 248, 255, 0.85)",
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                      boxShadow: PIXSELF_BRAND.shadows.glowStrong,
                      width: "min(100%, 280px)",
                      aspectRatio: "64/80",
                    }}
                  >
                    <div
                      className="absolute inset-2 opacity-20"
                      style={{
                        backgroundImage: `
        repeating-linear-gradient(
          0deg,
          ${PIXSELF_BRAND.colors.primary.gold}80 0px,
          ${PIXSELF_BRAND.colors.primary.gold}80 2px,
          transparent 2px,
          transparent 4px
        ),
        repeating-linear-gradient(
          90deg,
          ${PIXSELF_BRAND.colors.primary.gold}80 0px,
          ${PIXSELF_BRAND.colors.primary.gold}80 2px,
          transparent 2px,
          transparent 4px
        )
      `,
                      }}
                    />
                    <div className="absolute inset-3 flex items-center justify-center overflow-hidden">
                      <div style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
                        <PixelCanvasPreview selections={selections} scale={3.5} zoom={1} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Quick Actions */}
                <div className="flex items-center justify-center gap-2">
                  <PixselfButton
                    onClick={randomize}
                    disabled={loading}
                    loading={loading}
                    size="sm"
                    icon={<RefreshCw className="h-3 w-3" />}
                  >
                    RANDOM
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation()}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    variant="accent"
                    size="sm"
                    icon={<Download className="h-3 w-3" />}
                  >
                    SAVE
                  </PixselfButton>
                  {storageAvailable && (
                    <PixselfButton
                      onClick={() => setShowGalleryModal(true)}
                      variant="secondary"
                      size="sm"
                      icon={<Grid className="h-3 w-3" />}
                    >
                      GALLERY
                    </PixselfButton>
                  )}
                </div>
              </div>
            </PixselfPanel>

            {/* Mobile Parts Navigation - Horizontal Scroll */}
            <PixselfPanel title="CHARACTER PARTS" icon={<Layers className="h-4 w-4" />}>
              <div className="space-y-4">
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-stretch gap-2 min-w-max px-1">
                    {Object.entries(partsByCategory).map(([category, parts]) => (
                      <div key={category} className="flex items-stretch gap-2">
                        {/* Inline category badge */}
                        <div className="flex items-center">
                          <div
                            className="px-2 py-2 border-2 text-[8px] font-bold rounded-sm whitespace-nowrap"
                            style={{
                              backgroundColor: PIXSELF_BRAND.colors.sky.light,
                              borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                              color: PIXSELF_BRAND.colors.primary.navy,
                            }}
                          >
                            {category}
                          </div>
                        </div>

                        {/* Category parts inline */}
                        {parts.map((p) => {
                          const active = activePart === p.key
                          return (
                            <button
                              key={p.key}
                              onClick={() => {
                                setActivePart(p.key)
                                play8BitSound("click", soundEnabled)
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 border-2 text-[8px] font-bold backdrop-blur-sm transition-all duration-200 min-w-[70px]"
                              style={{
                                backgroundColor: active
                                  ? PIXSELF_BRAND.colors.primary.gold
                                  : PIXSELF_BRAND.colors.cloud.light,
                                borderColor: active
                                  ? PIXSELF_BRAND.colors.primary.navy
                                  : PIXSELF_BRAND.colors.primary.navyLight,
                                color: PIXSELF_BRAND.colors.primary.navy,
                              }}
                            >
                              <span className="text-[6px] font-mono leading-none">{p.icon}</span>
                              <span className="text-center leading-tight">{p.label}</span>
                              {active && (
                                <div
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                                />
                              )}
                            </button>
                          )
                        })}

                        {/* Group separator spacer */}
                        <div className="w-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Single swipe hint for the unified row */}
                <div className="text-center">
                  <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                    ← SWIPE →
                  </div>
                </div>
              </div>
            </PixselfPanel>

            {/* Mobile Customization Panel - Compact */}
            <PixselfPanel
              title={`CUSTOMIZE ${PIXSELF_PARTS.find((p) => p.key === activePart)?.label}`}
              icon={<Settings className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {/* Color Palette - Horizontal Scroll */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                    <div
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      COLOR PALETTE
                    </div>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max px-1">
                      {RETRO_CHARACTER_PALETTES[activePart].map((color, i) => (
                        <div key={i} className="flex-shrink-0">
                          <PixselfColorSwatch
                            color={color}
                            colorName={colorNames[activePart]?.[i]}
                            selected={selections[activePart].color === i}
                            onClick={() => onSelectColor(activePart, i)}
                            size="sm"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                      ← SWIPE TO SEE MORE COLORS →
                    </div>
                  </div>
                </div>

                {/* Style Variants - Mobile Horizontal Scroll */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                    <div
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      STYLE VARIANTS
                    </div>
                  </div>

                  {/* Mobile Horizontal Scroll Container */}
                  <div className="relative">
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-2 min-w-max px-1">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const isSelected = selections[activePart].variant === i

                          return (
                            <div key={i} className="flex-shrink-0">
                              <button
                                onClick={() => onSelectVariant(activePart, i)}
                                disabled={loading}
                                aria-label={`Select variant ${i + 1}`}
                                className={`
                relative w-14 h-14 border-4 transition-all duration-200 overflow-hidden
                flex flex-col items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                active:scale-95
                disabled:cursor-not-allowed disabled:opacity-50
                ${isSelected ? "scale-105" : "hover:scale-102"}
              `}
                                style={{
                                  backgroundColor: isSelected
                                    ? PIXSELF_BRAND.colors.primary.gold
                                    : PIXSELF_BRAND.colors.cloud.light,
                                  color: PIXSELF_BRAND.colors.primary.navy,
                                  borderColor: isSelected
                                    ? PIXSELF_BRAND.colors.primary.navy
                                    : PIXSELF_BRAND.colors.primary.navyLight,
                                  imageRendering: "pixelated",
                                }}
                              >
                                {/* Mini Canvas Preview */}
                                <MobileVariantPreview
                                  part={activePart}
                                  variant={i}
                                  color={RETRO_CHARACTER_PALETTES[activePart][selections[activePart].color]}
                                />

                                {/* Selection Indicator */}
                                {isSelected && (
                                  <div
                                    className="absolute top-0.5 right-0.5 w-2.5 h-2.5 border flex items-center justify-center"
                                    style={{
                                      backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                                    }}
                                  >
                                    <div
                                      className="w-1 h-1"
                                      style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }}
                                    />
                                  </div>
                                )}

                                {/* Variant Number Badge */}
                                <div
                                  className="absolute bottom-0.5 left-0.5 w-3 h-2.5 flex items-center justify-center text-[5px] font-bold border"
                                  style={{
                                    backgroundColor: isSelected
                                      ? PIXSELF_BRAND.colors.cloud.white
                                      : PIXSELF_BRAND.colors.sky.light,
                                    borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                                    color: isSelected
                                      ? PIXSELF_BRAND.colors.primary.gold
                                      : PIXSELF_BRAND.colors.primary.navyLight,
                                  }}
                                >
                                  {i + 1}
                                </div>

                                {/* Loading overlay */}
                                {loading && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="text-center">
                      <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                        ← SWIPE TO SEE MORE VARIANTS →
                      </div>
                    </div>
                  </div>

                  {/* Current Selection Info - Compact */}
                  <div
                    className="mt-3 p-2 border-2 flex items-center justify-between"
                    style={{
                      backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                      borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 border-2 flex items-center justify-center text-[7px] font-bold"
                        style={{
                          backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                          color: PIXSELF_BRAND.colors.primary.navy,
                        }}
                      >
                        {selections[activePart].variant + 1}
                      </div>
                      <div>
                        <div className="text-[8px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          VAR {selections[activePart].variant + 1}/10
                        </div>
                        <div className="text-[6px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          SELECTED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PixselfPanel>

            {/* Mobile Export Options */}
            <PixselfPanel title="EXPORT OPTIONS" icon={<Download className="h-4 w-4" />}>
              <div className="space-y-4">
                <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  Choose your export size:
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(6)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    SMALL (384×480)
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(12)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    MEDIUM (768×960)
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(24)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    LARGE (1536×1920)
                  </PixselfButton>
                </div>
                <div className="pt-3 border-t-4" style={{ borderTopColor: PIXSELF_BRAND.colors.primary.navy }}>
                  <PixselfButton
                    onClick={shareCharacter}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<Share2 className="h-3.5 w-3.5" />}
                  >
                    SHARE CHARACTER
                  </PixselfButton>
                </div>
              </div>
            </PixselfPanel>
          </div>
        )}
      </div>

      {/* Download Confirmation Modal */}
      {downloadModalData && (
        <DownloadConfirmationModal
          isOpen={showDownloadModal}
          onClose={() => {
            setShowDownloadModal(false)
            setDownloadModalData(null)
          }}
          onConfirm={downloadPng}
          characterPreview={downloadModalData.preview}
          fileName={downloadModalData.fileName}
          fileSize={downloadModalData.fileSize}
          isLoading={downloadLoading}
        />
      )}

      {/* Share Template Modal */}
      {sharePreviewData && (
        <ShareTemplateModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setSharePreviewData("")
          }}
          characterPreview={sharePreviewData}
          isLoading={shareLoading}
        />
      )}

      {/* Character Gallery Modal */}
      {storageAvailable && (
        <CharacterGalleryModal
          isOpen={showGalleryModal}
          onClose={() => setShowGalleryModal(false)}
          currentSelections={selections}
          onLoadCharacter={handleLoadCharacter}
          onSaveCharacter={handleSaveCharacter}
          generateThumbnail={generateThumbnail}
          soundEnabled={soundEnabled}
          onPlaySound={(type) => play8BitSound(type, soundEnabled)}
        />
      )}
    </main>
  )
}
