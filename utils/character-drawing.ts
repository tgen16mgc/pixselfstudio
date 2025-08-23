import { CHARACTER_PARTS, LAYER_ORDER, getAssetPath } from "@/config/character-assets"
import type { Selections } from "@/types/character"

// Image cache to avoid reloading images
const imageCache = new Map<string, HTMLImageElement>()

// Preload all character assets
export async function preloadCharacterAssets(): Promise<void> {
  const loadPromises: Promise<void>[] = []

  CHARACTER_PARTS().forEach((part) => {
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
  size: number | { width: number; height: number } = 1,
): Promise<void> {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Determine canvas dimensions
  let width: number
  let height: number
  if (typeof size === "number") {
    const baseSize = 640
    width = baseSize * size
    height = baseSize * size
  } else {
    width = size.width
    height = size.height
  }

  canvas.width = width
  canvas.height = height

  // Ensure pixel-perfect rendering
  ctx.imageSmoothingEnabled = false

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

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
      ctx.drawImage(img, 0, 0, width, height)
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

  CHARACTER_PARTS().forEach((part) => {
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

  CHARACTER_PARTS().forEach((part) => {
    // Filter out "none" assets for randomization, but keep them for manual selection
    const enabledAssets = part.assets.filter((asset) => asset.enabled && asset.id !== "none")
    
    // If no assets available (all are "none"), use default
    if (enabledAssets.length === 0) {
      selections[part.key] = {
        assetId: part.defaultAsset,
        enabled: true,
      }
    } else {
      const randomAsset = enabledAssets[Math.floor(Math.random() * enabledAssets.length)]
      
      selections[part.key] = {
        assetId: randomAsset.id,
        enabled: true, // Always enable when randomizing
      }
    }
  })

  return selections
}
