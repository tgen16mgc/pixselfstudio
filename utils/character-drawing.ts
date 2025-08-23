import { CHARACTER_PARTS_SYNC, LAYER_ORDER, getAssetPath } from "@/config/character-assets"
import { assetRegistry } from "@/utils/asset-registry"
import type { PartKey, Selections } from "@/types/character"

// Preload all character assets
export async function preloadCharacterAssets(): Promise<void> {
  try {
    // Initialize the asset registry
    await assetRegistry.getRegistry()
    console.log('✅ Character assets preloaded successfully')
  } catch (error) {
    console.error('❌ Failed to preload character assets:', error)
  }
}

// Draw character to canvas with support for color variants
export async function drawCharacterToCanvas(
  canvas: HTMLCanvasElement,
  selections: Selections,
  size: { width: number; height: number } = { width: 512, height: 512 }
): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Set canvas size
  canvas.width = size.width
  canvas.height = size.height

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw layers in order (back to front)
  for (const partKey of [...LAYER_ORDER].reverse()) {
    const selection = selections[partKey]
    if (!selection || !selection.enabled) continue

    try {
      // Get asset path with variant support
      const assetPath = await getAssetPath(partKey, selection.assetId, selection.colorVariant)
      if (!assetPath) continue

      // Load and draw the image
      await drawImageToCanvas(ctx, assetPath, size)
    } catch (error) {
      console.error(`Failed to draw ${partKey}:`, error)
    }
  }
}

// Helper function to draw an image to canvas
async function drawImageToCanvas(
  ctx: CanvasRenderingContext2D,
  imagePath: string,
  size: { width: number; height: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Draw the image to fit the canvas
        ctx.drawImage(img, 0, 0, size.width, size.height)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imagePath}`))
    }
    
    // Set the image source
    img.src = imagePath
  })
}

// Get asset information for a specific part and selection
export async function getAssetInfo(partKey: PartKey, assetId: string, variantId?: string) {
  try {
    const asset = await assetRegistry.getAsset(partKey, assetId)
    if (!asset) return null

    const variant = variantId 
      ? asset.variants.find(v => v.id === variantId)
      : asset.variants.find(v => v.id === asset.defaultVariant)

    return {
      asset,
      variant,
      path: variant?.path || '',
      color: variant?.color || null,
    }
  } catch (error) {
    console.error(`Failed to get asset info for ${partKey}:`, error)
    return null
  }
}

// Get all available variants for an asset
export async function getAssetVariants(partKey: PartKey, assetId: string) {
  try {
    const asset = await assetRegistry.getAsset(partKey, assetId)
    return asset?.variants || []
  } catch (error) {
    console.error(`Failed to get variants for ${partKey}:`, error)
    return []
  }
}

// Get all available colors for a part
export async function getAvailableColorsForPart(partKey: PartKey) {
  try {
    const part = await assetRegistry.getPart(partKey)
    return part?.colorPalette || []
  } catch (error) {
    console.error(`Failed to get colors for ${partKey}:`, error)
    return []
  }
}

// Validate a selection (check if asset and variant exist)
export async function validateSelection(partKey: PartKey, assetId: string, variantId?: string): Promise<boolean> {
  try {
    const asset = await assetRegistry.getAsset(partKey, assetId)
    if (!asset) return false

    if (variantId) {
      const variant = asset.variants.find(v => v.id === variantId)
      return !!variant
    }

    return true
  } catch (error) {
    console.error(`Failed to validate selection for ${partKey}:`, error)
    return false
  }
}

// Create default selections for all character parts
export function createDefaultSelections(): Selections {
  const partKeys: PartKey[] = ["body", "hairBehind", "clothes", "mouth", "eyes", "eyebrows", "hairFront", "earring", "glasses", "blush"]
  const selections: Selections = {} as Selections

  for (const partKey of partKeys) {
    selections[partKey] = {
      assetId: partKey === "body" ? "default" : "none",
      enabled: partKey === "body", // Only body is enabled by default
      colorVariant: undefined
    }
  }

  return selections
}

// Generate a thumbnail image from character selections
export async function generateCharacterThumbnail(
  selections: Selections, 
  size: number = 256
): Promise<string> {
  // Create a temporary canvas for thumbnail generation
  const canvas = document.createElement('canvas')
  const targetSize = { width: size, height: size }
  
  try {
    // Draw the character to the canvas
    await drawCharacterToCanvas(canvas, selections, targetSize)
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Failed to generate character thumbnail:', error)
    throw error
  }
}

// Create randomized character selections
export function randomizeSelections(): Selections {
  const partKeys: PartKey[] = ["body", "hairBehind", "clothes", "mouth", "eyes", "eyebrows", "hairFront", "earring", "glasses", "blush"]
  const selections: Selections = {} as Selections

  // Helper function to get random choice
  const getRandomChoice = (options: string[]) => 
    options[Math.floor(Math.random() * options.length)]

  // Define some basic asset options for randomization
  const assetOptions = {
    body: ["default"],
    hairBehind: ["none", "default"],
    clothes: ["none", "default"],
    mouth: ["none", "default"],
    eyes: ["none", "default"],
    eyebrows: ["none", "default"],
    hairFront: ["none", "default"],
    earring: ["none"],
    glasses: ["none"],
    blush: ["none"]
  }

  // Color variants for randomization
  const colorVariants = ["default", "black", "white", "pink", "yellow", "red", "blue", "brown", "green"]

  for (const partKey of partKeys) {
    const availableAssets = assetOptions[partKey] || ["none"]
    const selectedAsset = getRandomChoice(availableAssets)
    const shouldEnable = partKey === "body" || (selectedAsset !== "none" && Math.random() > 0.3)
    
    selections[partKey] = {
      assetId: selectedAsset,
      enabled: shouldEnable,
      colorVariant: shouldEnable && Math.random() > 0.5 ? getRandomChoice(colorVariants) : undefined
    }
  }

  // Ensure body is always enabled
  selections.body.enabled = true

  return selections
}
