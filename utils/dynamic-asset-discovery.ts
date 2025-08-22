import { AssetDefinition, PartDefinition } from "@/config/character-assets"
import type { PartKey } from "@/types/character"

// Dynamic asset discovery that fetches from API
export async function getCharacterPartsFromAPI(): Promise<PartDefinition[]> {
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
  }

  try {
    // Fetch scanned assets from API
    const response = await fetch('/api/assets')
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    const scannedAssets: Record<string, string[]> = data.assets

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

      // Add all scanned assets for this part
      const partAssets = scannedAssets[partKey] || []
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
    }

    return parts
  } catch (error) {
    console.error('Failed to fetch assets from API:', error)
    // Fall back to empty parts if API fails
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
