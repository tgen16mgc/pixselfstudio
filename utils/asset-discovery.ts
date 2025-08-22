import { AssetDefinition, PartDefinition } from "@/types/character"
import type { PartKey } from "@/types/character"

// Asset discovery utility that automatically scans folders for assets
export async function discoverAssets(): Promise<PartDefinition[]> {
  // Define the folder structure mapping
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
      folderPath: "/assets/character/body/body",
      defaultAsset: "default",
      optional: false,
    },
    clothes: {
      label: "CLOTHES", 
      icon: "👕",
      category: "Body",
      folderPath: "/assets/character/body/clothes",
      defaultAsset: "default",
      optional: true,
    },
    hairBehind: {
      label: "HAIR BEHIND",
      icon: "🎭", 
      category: "Hair",
      folderPath: "/assets/character/hair/hair-behind",
      defaultAsset: "default",
      optional: true,
    },
    hairFront: {
      label: "HAIR FRONT",
      icon: "💇",
      category: "Hair", 
      folderPath: "/assets/character/hair/hair-front",
      defaultAsset: "default",
      optional: true,
    },
    eyes: {
      label: "EYES",
      icon: "👀",
      category: "Face",
      folderPath: "/assets/character/face/eyes", 
      defaultAsset: "default",
      optional: true,
    },
    eyebrows: {
      label: "EYEBROWS",
      icon: "🤨",
      category: "Face",
      folderPath: "/assets/character/face/eyebrows",
      defaultAsset: "default", 
      optional: true,
    },
    mouth: {
      label: "MOUTH",
      icon: "👄",
      category: "Face",
      folderPath: "/assets/character/face/mouth",
      defaultAsset: "default",
      optional: true,
    },
    blush: {
      label: "BLUSH",
      icon: "😊",
      category: "Face", 
      folderPath: "/assets/character/face/blush",
      defaultAsset: "none",
      optional: true,
    },
    earring: {
      label: "EARRING",
      icon: "💎",
      category: "Accessories",
      folderPath: "/assets/character/accessories/earring",
      defaultAsset: "none",
      optional: true,
    },
    glasses: {
      label: "GLASSES",
      icon: "🤓", 
      category: "Accessories",
      folderPath: "/assets/character/accessories/glasses",
      defaultAsset: "none",
      optional: true,
    },
  }

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

    try {
      // In a real app, you'd scan the actual filesystem here
      // For now, we'll use a predefined list but make it easy to extend
      const discoveredAssets = await scanFolderForAssets(config.folderPath, partKey as PartKey)
      assets.push(...discoveredAssets)
    } catch (error) {
      console.warn(`Could not scan folder ${config.folderPath}:`, error)
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
}

// Helper function to scan a folder for assets (simplified version)
async function scanFolderForAssets(folderPath: string, partKey: PartKey): Promise<AssetDefinition[]> {
  // This is a simplified version - in a real implementation, you'd scan the filesystem
  // For now, we'll return known assets but make it easy to extend
  
  const knownAssets: Record<string, AssetDefinition[]> = {
    "/assets/character/body/body": [
      {
        id: "default",
        name: "Default Body",
        path: "/assets/character/body/body/body-default.png",
        enabled: true,
      }
    ],
    "/assets/character/body/clothes": [
      {
        id: "default", 
        name: "Default Clothes",
        path: "/assets/character/body/clothes/clothes-default.png",
        enabled: true,
      }
    ],
    "/assets/character/hair/hair-behind": [
      {
        id: "default",
        name: "Default Hair Behind", 
        path: "/assets/character/hair/hair-behind/hair-behind-default.png",
        enabled: true,
      }
    ],
    "/assets/character/hair/hair-front": [
      {
        id: "default",
        name: "Default Hair Front",
        path: "/assets/character/hair/hair-front/hair-front-default.png", 
        enabled: true,
      }
    ],
    "/assets/character/face/eyes": [
      {
        id: "default",
        name: "Default Eyes",
        path: "/assets/character/face/eyes/eyes-default.png",
        enabled: true,
      }
    ],
    "/assets/character/face/eyebrows": [
      {
        id: "default", 
        name: "Default Eyebrows",
        path: "/assets/character/face/eyebrows/eyebrows-default.png",
        enabled: true,
      }
    ],
    "/assets/character/face/mouth": [
      {
        id: "default",
        name: "Default Mouth",
        path: "/assets/character/face/mouth/mouth-default.png",
        enabled: true,
      }
    ],
    "/assets/character/face/blush": [
      {
        id: "default",
        name: "Default Blush", 
        path: "/assets/character/face/blush/blush-default.png",
        enabled: true,
      }
    ],
    "/assets/character/accessories/earring": [
      {
        id: "default",
        name: "Default Earring",
        path: "/assets/character/accessories/earring/earring-default.png",
        enabled: true,
      }
    ],
    "/assets/character/accessories/glasses": [
      {
        id: "default",
        name: "Default Glasses",
        path: "/assets/character/accessories/glasses/glasses-default.png", 
        enabled: true,
      }
    ],
  }

  return knownAssets[folderPath] || []
}

// Function to generate asset ID from filename
export function generateAssetId(filename: string): string {
  return filename
    .replace(/\.(png|jpg|jpeg|svg)$/i, '')
    .replace(/^[^-]+-/, '') // Remove part prefix (e.g., "hair-front-" -> "")
}

// Function to generate asset name from filename  
export function generateAssetName(filename: string, partName: string): string {
  const id = generateAssetId(filename)
  if (id === 'default') {
    return `Default ${partName}`
  }
  
  // Convert kebab-case to Title Case
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
