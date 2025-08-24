"use client"

import { RETRO_UI_THEME } from "@/config/8bit-theme"

// Pixel grid constants
const GRID_W = 64
const GRID_H = 80

// Drawing helper functions
function clear(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

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

// Part drawing functions
function drawHead(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = GRID_W / 2
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
  const cx = GRID_W / 2
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
  const cx = GRID_W / 2
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
  const cx = GRID_W / 2
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
  const cx = GRID_W / 2
  const y = 46
  const v = variant % 10
  if (v < 3) pixelCircle(ctx, cx, y, 1.5, color, u)
  else if (v < 6) pixelRect(ctx, cx - 6, y, 12, 2, color, u)
  else if (v < 8) pixelRect(ctx, cx - 5, y - 1, 10, 4, color, u)
  else pixelRect(ctx, cx - 6, y + 1, 12, 2, color, u)
}

function drawBody(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = GRID_W / 2
  const v = variant % 10
  if (v < 3) pixelRect(ctx, cx - 18, 50, 36, 18, color, u)
  else if (v < 6) pixelRect(ctx, cx - 20, 50, 40, 18, color, u)
  else if (v < 8) pixelRect(ctx, cx - 16, 50, 32, 20, color, u)
  else pixelRect(ctx, cx - 22, 50, 44, 18, color, u)
  pixelRect(ctx, cx - 24, 56, 6, 6, color, u)
  pixelRect(ctx, cx + 18, 56, 6, 6, color, u)
}

function drawCostume(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = GRID_W / 2
  const v = variant % 10
  if (v === 0) return
  pixelRect(ctx, cx - 18, 52, 36, 14, color, u)
  if (v < 3) pixelRect(ctx, cx - 16, 58, 32, 2, RETRO_UI_THEME.text.primary, u)
  else if (v < 6) pixelRect(ctx, cx + 6, 56, 8, 6, RETRO_UI_THEME.text.primary, u)
  else if (v < 8) {
    pixelCircle(ctx, cx, 56, 1.2, RETRO_UI_THEME.text.primary, u)
    pixelCircle(ctx, cx, 60, 1.2, RETRO_UI_THEME.text.primary, u)
  } else {
    pixelRect(ctx, cx - 6, 56, 12, 6, RETRO_UI_THEME.text.primary, u)
  }
}

function drawShoes(ctx: CanvasRenderingContext2D, variant: number, color: string, u: number) {
  const cx = GRID_W / 2
  const v = variant % 10
  const w = v % 2 === 0 ? 10 : 12
  pixelRect(ctx, cx - 12 - (w - 10) / 2, 68, w, 6, color, u)
  pixelRect(ctx, cx + 2 - (w - 10) / 2, 68, w, 6, color, u)
}

function drawSilhouette(ctx: CanvasRenderingContext2D, u: number) {
  const ghost = "#444444"
  drawBody(ctx, 0, ghost, u)
  drawHead(ctx, 1, ghost, u)
  drawShoes(ctx, 0, ghost, u)
}

// Main thumbnail generation function
export function generateVariantThumbnails(part: string, color: string, size = 100): string[] {
  const u = Math.max(1, Math.floor(size / Math.max(GRID_W, GRID_H)))
  const urls: string[] = []

  for (let v = 0; v < 10; v++) {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = GRID_W * u
      canvas.height = GRID_H * u
      const ctx = canvas.getContext("2d")!

      // Ensure pixel-perfect rendering
      ctx.imageSmoothingEnabled = false

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw subtle silhouette background
      drawSilhouette(ctx, u)

      // Draw the specific part variant with the selected color
      switch (part) {
        case "head":
          drawHead(ctx, v, color, u)
          break
        case "hair":
          drawHair(ctx, v, color, u)
          break
        case "eyes":
          drawEyes(ctx, v, color, u)
          break
        case "eyebrows":
          drawBrows(ctx, v, color, u)
          break
        case "mouth":
          drawMouth(ctx, v, color, u)
          break
        case "body":
          drawBody(ctx, v, color, u)
          break
        case "costume":
          drawCostume(ctx, v, color, u)
          break
        case "shoes":
          drawShoes(ctx, v, color, u)
          break
        default:
          // Fallback: draw a simple rectangle
          pixelRect(ctx, GRID_W / 2 - 8, GRID_H / 2 - 8, 16, 16, color, u)
          break
      }

      urls.push(canvas.toDataURL("image/png"))
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${part} variant ${v}:`, error)
      // Create a fallback thumbnail
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = color
      ctx.fillRect(10, 10, size - 20, size - 20)
      urls.push(canvas.toDataURL("image/png"))
    }
  }

  return urls
}

// Helper function to generate a single thumbnail
export function generateSingleThumbnail(part: string, variant: number, color: string, size = 100): string {
  try {
    const u = Math.max(1, Math.floor(size / Math.max(GRID_W, GRID_H)))
    const canvas = document.createElement("canvas")
    canvas.width = GRID_W * u
    canvas.height = GRID_H * u
    const ctx = canvas.getContext("2d")!

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw silhouette
    drawSilhouette(ctx, u)

    // Draw the specific part variant
    switch (part) {
      case "head":
        drawHead(ctx, variant, color, u)
        break
      case "hair":
        drawHair(ctx, variant, color, u)
        break
      case "eyes":
        drawEyes(ctx, variant, color, u)
        break
      case "eyebrows":
        drawBrows(ctx, variant, color, u)
        break
      case "mouth":
        drawMouth(ctx, variant, color, u)
        break
      case "body":
        drawBody(ctx, variant, color, u)
        break
      case "costume":
        drawCostume(ctx, variant, color, u)
        break
      case "shoes":
        drawShoes(ctx, variant, color, u)
        break
      default:
        pixelRect(ctx, GRID_W / 2 - 8, GRID_H / 2 - 8, 16, 16, color, u)
        break
    }

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error(`Failed to generate single thumbnail for ${part}:`, error)
    // Return a simple fallback
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = color
    ctx.fillRect(10, 10, size - 20, size - 20)
    return canvas.toDataURL("image/png")
  }
}
