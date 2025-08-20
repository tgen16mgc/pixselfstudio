import { CHARACTER_PARTS, LAYER_ORDER, getAssetPath } from "@/config/character-assets"
import type { Selections } from "@/types/character"

// Image cache to avoid reloading images
const imageCache = new Map<string, HTMLImageElement>()

// Preload all character assets
export async function preloadCharacterAssets(): Promise<void> {
  const loadPromises: Promise<void>[] = []

  CHARACTER_PARTS.forEach((part) => {
    part.assets.forEach((asset) => {
      if (asset.path && asset.enabled) {
        loadPromises.push(loadImage(asset.path))
      }
    })
  })

  await Promise.all(loadPromises)
}

// Load and cache an image
function loadImage(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(path)) {
      resolve()
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      imageCache.set(path, img)
      resolve()
    }

    img.onerror = () => {
      console.error(`Failed to load image: ${path}`)
      reject(new Error(`Failed to load image: ${path}`))
    }

    img.src = path
  })
}

// Get cached image
function getCachedImage(path: string): HTMLImageElement | null {
  return imageCache.get(path) || null
}

// Main character drawing function
export async function drawCharacterToCanvas(
  canvas: HTMLCanvasElement,
  selections: Selections,
  scale = 1,
): Promise<void> {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set canvas size - using 640x640 as base since that's your asset size
  const baseSize = 640
  canvas.width = baseSize * scale
  canvas.height = baseSize * scale

  // Ensure pixel-perfect rendering
  ctx.imageSmoothingEnabled = false

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw layers in order (lowest to highest)
  const reversedOrder = [...LAYER_ORDER].reverse()

  for (const partKey of reversedOrder) {
    const selection = selections[partKey]

    // Skip if part is disabled or not selected
    if (!selection || !selection.enabled) continue

    const assetPath = getAssetPath(partKey, selection.assetId)

    // Skip if no asset path (like "none" option)
    if (!assetPath) continue

    // Get cached image
    let img = getCachedImage(assetPath)

    // If not cached, load it now
    if (!img) {
      try {
        await loadImage(assetPath)
        img = getCachedImage(assetPath)
      } catch (error) {
        console.error(`Failed to load asset for ${partKey}:`, error)
        continue
      }
    }

    if (img) {
      // Draw the image scaled to canvas size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }
}

// Generate thumbnail for a character
export async function generateCharacterThumbnail(selections: Selections, size = 200): Promise<string> {
  const canvas = document.createElement("canvas")
  const scale = size / 640 // Scale down from 640x640 to desired size

  await drawCharacterToCanvas(canvas, selections, scale)

  return canvas.toDataURL("image/png")
}

// Create default selections
export function createDefaultSelections(): Selections {
  const selections: Selections = {} as Selections

  CHARACTER_PARTS.forEach((part) => {
    selections[part.key] = {
      assetId: part.defaultAsset,
      enabled: true, // All parts start enabled by default
    }
  })

  return selections
}

// Randomize character selections
export function randomizeSelections(): Selections {
  const selections: Selections = {} as Selections

  CHARACTER_PARTS.forEach((part) => {
    const enabledAssets = part.assets.filter((asset) => asset.enabled)
    const randomAsset = enabledAssets[Math.floor(Math.random() * enabledAssets.length)]

    selections[part.key] = {
      assetId: randomAsset.id,
      enabled: randomAsset.id !== "none", // Enable if not "none"
    }
  })

  return selections
}
