import { AssetDefinition, PartDefinition } from "@/config/character-assets"
import type { PartKey } from "@/types/character"

// Asset discovery that reads from a simple JSON manifest
export async function getCharacterPartsFromManifest(): Promise<PartDefinition[]> {
  console.log('🚀 getCharacterPartsFromManifest called - START')
  
  // Define the part configurations
  const partConfigs: Record<PartKey, {
    label: string
    icon: string
    category: "Body" | "Face" | "Hair" | "Accessories"
    folderPath: string
    defaultAsset: string
    optional: boolean
  }> = {
    body: {
      label: "BODY",
      icon: "👤",
      category: "Body",
      folderPath: "body/body",
      defaultAsset: "default",
      optional: false,
    },
    clothes: {
      label: "CLOTHES", 
      icon: "👕",
      category: "Body",
      folderPath: "body/clothes",
      defaultAsset: "default",
      optional: true,
    },
    hairBehind: {
      label: "HAIR BEHIND",
      icon: "🎭", 
      category: "Hair",
      folderPath: "hair/hair-behind",
      defaultAsset: "default",
      optional: true,
    },
    hairFront: {
      label: "HAIR FRONT",
      icon: "💇",
      category: "Hair", 
      folderPath: "hair/hair-front",
      defaultAsset: "default",
      optional: true,
    },
    eyes: {
      label: "EYES",
      icon: "👀",
      category: "Face",
      folderPath: "face/eyes", 
      defaultAsset: "default",
      optional: true,
    },
    eyebrows: {
      label: "EYEBROWS",
      icon: "🤨",
      category: "Face",
      folderPath: "face/eyebrows",
      defaultAsset: "default", 
      optional: true,
    },
    mouth: {
      label: "MOUTH",
      icon: "👄",
      category: "Face",
      folderPath: "face/mouth",
      defaultAsset: "default",
      optional: true,
    },
    blush: {
      label: "BLUSH",
      icon: "😊",
      category: "Face", 
      folderPath: "face/blush",
      defaultAsset: "none",
      optional: true,
    },
    earring: {
      label: "EARRING",
      icon: "💎",
      category: "Accessories",
      folderPath: "accessories/earring",
      defaultAsset: "none",
      optional: true,
    },
    glasses: {
      label: "GLASSES",
      icon: "🤓", 
      category: "Accessories",
      folderPath: "accessories/glasses",
      defaultAsset: "none",
      optional: true,
    },
    hat: {
      label: "HAT",
      icon: "🎩",
      category: "Accessories",
      folderPath: "accessories/hat",
      defaultAsset: "none",
      optional: true,
    },
  }

  console.log('🚀 Part configs defined, starting fetch...')

  try {
    // Fetch the asset manifest with full URL to avoid relative path issues
    const manifestUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/assets/asset-manifest.json`
      : '/assets/asset-manifest.json'
    
    console.log('🔍 Fetching manifest from:', manifestUrl)
    const response = await fetch(manifestUrl)
    console.log('🔍 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`)
    }
    
    const manifest: Record<string, string[]> = await response.json()
    console.log('✅ Dynamic assets loaded from manifest:', manifest)
    console.log('🔍 Manifest keys:', Object.keys(manifest))
    console.log('🔍 Glasses assets:', manifest.glasses)

    const parts: PartDefinition[] = []

    for (const [partKey, config] of Object.entries(partConfigs)) {
      const assets: AssetDefinition[] = []
      
      // Always add "none" option for optional parts
      if (config.optional) {
        assets.push({
          id: "none",
          name: `No ${config.label}`,
          path: "",
          enabled: true,
        })
      }

      // Add all assets from manifest for this part
      const partAssets = manifest[partKey] || []
      for (const filename of partAssets) {
        const assetId = generateAssetId(filename)
        const assetName = generateAssetName(filename, config.label)
        const assetPath = `/assets/character/${config.folderPath}/${filename}`
        
        assets.push({
          id: assetId,
          name: assetName,
          path: assetPath,
          enabled: true,
        })
      }

      parts.push({
        key: partKey as PartKey,
        label: config.label,
        icon: config.icon,
        category: config.category,
        assets,
        defaultAsset: config.defaultAsset,
        optional: config.optional,
      })
      
      // Debug logging for glasses specifically
      if (partKey === 'glasses') {
        console.log('🤓 Glasses part generated:', {
          key: partKey,
          assetsCount: assets.length,
          assets: assets.map(a => ({ id: a.id, name: a.name, path: a.path }))
        })
      }
    }

    console.log('✅ Generated parts:', parts.length, 'total parts')
    return parts
  } catch (error) {
    console.error('❌ Failed to load asset manifest:', error)
    // Return empty parts if manifest fails to load
    return Object.entries(partConfigs).map(([partKey, config]) => ({
      key: partKey as PartKey,
      label: config.label,
      icon: config.icon,
      category: config.category,
      assets: config.optional ? [{
        id: "none",
        name: `No ${config.label}`,
        path: "",
        enabled: true,
      }] : [],
      defaultAsset: config.defaultAsset,
      optional: config.optional,
    }))
  }
}

// Function to generate asset ID from filename
function generateAssetId(filename: string): string {
  return filename
    .replace(/\.(png|jpg|jpeg|svg)$/i, '')
    .replace(/^[^-]+-/, '') // Remove part prefix (e.g., "hair-front-" -> "")
}

// Function to generate asset name from filename  
function generateAssetName(filename: string, partLabel: string): string {
  const id = generateAssetId(filename)
  if (id === 'default') {
    return `Default ${partLabel}`
  }
  
  // Convert kebab-case to Title Case
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
