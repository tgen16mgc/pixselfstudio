import { AssetDefinition } from "@/types/character"

// Cache for asset existence checks to avoid repeated network calls
const assetExistenceCache = new Map<string, boolean>()

/**
 * Check if an asset file actually exists
 */
export async function checkAssetExists(assetPath: string): Promise<boolean> {
  // Check cache first
  if (assetExistenceCache.has(assetPath)) {
    return assetExistenceCache.get(assetPath)!
  }

  try {
    // In development/build environment, be more conservative about what exists
    // Only allow existing assets that we know are real
    const knownAssets = [
      'hair-front-tomboy-brown.png',
      'hair-front-tomboy-black.png', 
      'hair-behind-curly-black.png'
      // Note: body color variants removed since they don't exist yet
    ]
    
    const filename = assetPath.split('/').pop() || ''
    if (knownAssets.includes(filename)) {
      assetExistenceCache.set(assetPath, true)
      return true
    }
    
    // For network requests in browser, use a timeout to avoid hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(assetPath, { 
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const exists = response.ok
    
    // Cache the result
    assetExistenceCache.set(assetPath, exists)
    return exists
  } catch (error) {
    // If fetch fails (including timeout), assume asset doesn't exist
    console.warn(`Asset check failed for ${assetPath}:`, error)
    assetExistenceCache.set(assetPath, false)
    return false
  }
}

/**
 * Filter assets to only include those that actually exist
 */
export async function filterExistingAssets(assets: AssetDefinition[]): Promise<AssetDefinition[]> {
  const existingAssets: AssetDefinition[] = []
  
  for (const asset of assets) {
    // Skip "none" assets as they don't need files
    if (asset.id === 'none' || !asset.path) {
      existingAssets.push(asset)
      continue
    }
    
    const exists = await checkAssetExists(asset.path)
    if (exists) {
      existingAssets.push(asset)
    } else {
      console.warn(`Asset not found: ${asset.path}`)
    }
  }
  
  return existingAssets
}

/**
 * Get color variants for a base asset that actually exist
 */
export async function getExistingColorVariants(
  baseAsset: AssetDefinition, 
  colorVariants: Record<string, string>
): Promise<AssetDefinition[]> {
  const existingVariants: AssetDefinition[] = []
  
  for (const [colorName, colorHex] of Object.entries(colorVariants)) {
    // Generate the expected color variant path
    const colorVariantPath = baseAsset.path.replace(/\.png$/, `-${colorName}.png`)
    
    const exists = await checkAssetExists(colorVariantPath)
    if (exists) {
      existingVariants.push({
        ...baseAsset,
        id: `${baseAsset.id}-${colorName}`,
        name: `${baseAsset.name} (${colorName.charAt(0).toUpperCase() + colorName.slice(1)})`,
        path: colorVariantPath,
        color: colorHex,
        enabled: true,
      })
    }
  }
  
  return existingVariants
}

/**
 * Clear the asset existence cache (useful for development)
 */
export function clearAssetCache(): void {
  assetExistenceCache.clear()
}