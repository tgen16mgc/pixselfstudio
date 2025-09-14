import { CHARACTER_PARTS, LAYER_ORDER, getAssetPath } from "@/config/character-assets"
import type { Selections } from "@/types/character"
import { resolveAssetPath } from "./asset-path-resolver"

// Global manifest cache for color variants
let colorVariantsManifest: any = null;

// Load the color variants manifest
async function loadColorVariantsManifest() {
  if (colorVariantsManifest) return colorVariantsManifest;
  
  try {
    const response = await fetch('/assets/color-variants-manifest.json');
    if (response.ok) {
      colorVariantsManifest = await response.json();
      console.log('📋 Color variants manifest loaded for character drawing');
    }
  } catch (error) {
    console.warn('Failed to load color variants manifest for drawing:', error);
  }
  
  return colorVariantsManifest;
}

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

// Preload a specific image path
export async function preloadImage(path: string): Promise<HTMLImageElement> {
  // Check if already cached
  const cached = getCachedImage(path)
  if (cached) {
    return cached
  }
  
  // Load and cache the image
  return loadImage(path)
}

// Preload all color variants for a specific asset to prevent flashing
export async function preloadAssetVariants(partKey: PartKey, baseAssetId: string): Promise<void> {
  try {
    // Load the color variants manifest
    const manifest = await loadColorVariantsManifest()
    if (!manifest) return
    
    // Find all variants for this asset
    const variantPaths: string[] = []
    
    for (const asset of manifest.assets) {
      // Check if this is the base asset we're looking for
      if (asset.baseId.includes(baseAssetId)) {
        // Add base path
        if (asset.basePath) {
          variantPaths.push(`https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public${asset.basePath}`)
        }
        
        // Add all variant paths
        for (const variant of asset.variants) {
          variantPaths.push(`https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public${variant.path}`)
        }
        break
      }
    }
    
    // Preload all found paths in parallel
    if (variantPaths.length > 0) {
      await Promise.all(variantPaths.map(path => preloadImage(path).catch(console.error)))
      console.log(`🚀 Preloaded ${variantPaths.length} variants for ${partKey}:${baseAssetId}`)
    }
  } catch (error) {
    console.error(`Failed to preload variants for ${partKey}:${baseAssetId}:`, error)
  }
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

    // Try to get the path from the color variants manifest first
    let assetPath: string | null = null;
    
    // Load manifest if needed
    const manifest = await loadColorVariantsManifest();
    
    // Check if this is a color variant in the manifest
    if (manifest && selection.assetId.includes('-')) {
      console.log(`🔍 Looking for variant ${selection.assetId} in manifest for part ${partKey}`);
      // Find the matching asset in the manifest
      for (const asset of manifest.assets) {
        // Check if this variant exists in the asset's variants array
        const variant = asset.variants.find((v: any) => v.id === selection.assetId);
        if (variant) {
          assetPath = `https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public${variant.path}`;
          console.log(`🎯 Found variant path in manifest: ${assetPath}`);
          break;
        }
        
        // Also check if the selection.assetId matches the base asset
        if (asset.baseId.endsWith(`-${selection.assetId}`) && asset.basePath) {
          assetPath = `https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public${asset.basePath}`;
          console.log(`🎯 Found base asset path in manifest: ${assetPath}`);
          break;
        }
      }
      
      if (!assetPath) {
        console.warn(`⚠️ No variant found in manifest for ${partKey}:${selection.assetId}`);
      }
    }
    
    // Try our improved asset path resolver if manifest didn't have it
    if (!assetPath) {
      assetPath = resolveAssetPath(partKey, selection.assetId)
    }
    
    // Fallback to the original path resolver if needed
    if (!assetPath) {
      assetPath = getAssetPath(partKey, selection.assetId)
    }

    // Skip if no asset path (like "none" option)
    if (!assetPath) {
      console.warn(`⚠️ No asset path found for ${partKey}:${selection.assetId}`)
      continue
    }

    console.log(`🎨 Drawing ${partKey}:${selection.assetId} with path: ${assetPath}`)

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
