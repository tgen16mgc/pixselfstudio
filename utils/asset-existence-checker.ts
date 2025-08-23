import { AssetDefinition } from "@/types/character"
import { COLOR_VARIANTS } from "@/config/color-variants"

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
      // Base hair front assets
      'hair-front-tomboy.png',        // Base tomboy asset
      'hair-front-2side.png',
      'hair-front-64.png', 
      'hair-front-long37.png',
      // Hair front color variants - only include ones that actually exist
      'hair-front-tomboy-brown.png',  // Brown variant (verified to exist)
      // Hair behind assets
      'hair-behind-curly-black.png',
      'hair-behind-2side.png',
      'hair-behind-curly.png',
      // Mouth assets
      'mouth-smile1.png',            // Base smile1 asset
      'mouth-smile1-pink.png',       // Pink variant for smile1
      'mouth-default.png',
      'mouth-small.png'
      // Note: Only include assets that actually exist in the file system
      // Do not add theoretical color variants that haven't been created yet
    ]
    
    const filename = assetPath.split('/').pop() || ''
    const existsInKnownAssets = knownAssets.includes(filename)
    
    // Add debug logging for color variants specifically
    if (filename.includes('tomboy') && filename.includes('-')) {
      console.log(`🎨 Color variant check: ${filename} -> ${existsInKnownAssets ? 'EXISTS' : 'NOT FOUND'}`)
    }
    
    if (existsInKnownAssets) {
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
  
  // Special case for smile1 and smile1-pink
  if (baseAsset.id === 'smile1') {
    console.log(`🔍 Checking smile1 mouth variants`)
    
    // Check if smile1-pink exists
    const pinkVariantPath = baseAsset.path.replace(/\.png$/, `-pink.png`)
    const pinkExists = await checkAssetExists(pinkVariantPath)
    
    if (pinkExists) {
      existingVariants.push({
        ...baseAsset,
        id: `${baseAsset.id}-pink`,
        name: `${baseAsset.name} (Pink)`,
        path: pinkVariantPath,
        color: COLOR_VARIANTS.mouth.pink,
        enabled: true,
      })
    }
    
    // Always add the base asset as a "default" variant
    existingVariants.push({
      ...baseAsset,
      id: baseAsset.id,
      name: `${baseAsset.name} (Default)`,
      path: baseAsset.path,
      color: "#666666", // Default gray color
      enabled: true,
    })
    
    return existingVariants
  }
  
  // Add debug logging for tomboy assets specifically
  if (baseAsset.id === 'tomboy') {
    console.log(`🔍 Checking color variants for tomboy hair:`, baseAsset)
    console.log(`🎨 Available colors to check:`, Object.keys(colorVariants))
  }
  
  // Always add the base asset as a "default" variant first
  existingVariants.push({
    ...baseAsset,
    id: baseAsset.id,
    name: `${baseAsset.name} (Default)`,
    path: baseAsset.path,
    color: "#666666", // Default gray color
    enabled: true,
  })
  
  // Special case for tomboy-brown
  if (baseAsset.id === 'tomboy') {
    const brownVariantPath = baseAsset.path.replace(/\.png$/, `-brown.png`)
    const brownExists = await checkAssetExists(brownVariantPath)
    
    if (brownExists) {
      existingVariants.push({
        ...baseAsset,
        id: `${baseAsset.id}-brown`,
        name: `${baseAsset.name} (Brown)`,
        path: brownVariantPath,
        color: COLOR_VARIANTS.hair.brown,
        enabled: true,
      })
    }
  }
  
  // Check for other color variants
  for (const [colorName, colorHex] of Object.entries(colorVariants)) {
    // Skip colors we've already handled in special cases
    if ((baseAsset.id === 'tomboy' && colorName === 'brown') ||
        (baseAsset.id === 'smile1' && colorName === 'pink')) {
      continue
    }
    
    // Generate the expected color variant path
    const colorVariantPath = baseAsset.path.replace(/\.png$/, `-${colorName}.png`)
    
    const exists = await checkAssetExists(colorVariantPath)
    
    // Debug logging for tomboy variants
    if (baseAsset.id === 'tomboy') {
      console.log(`  ${colorName}: ${colorVariantPath} -> ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`)
    }
    
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
  
  // Final debug log for tomboy
  if (baseAsset.id === 'tomboy') {
    console.log(`🎯 Found ${existingVariants.length} existing color variants for tomboy:`, 
      existingVariants.map(v => v.id))
  }
  
  return existingVariants
}

/**
 * Clear the asset existence cache (useful for development)
 */
export function clearAssetCache(): void {
  assetExistenceCache.clear()
}