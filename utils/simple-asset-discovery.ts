import { AssetDefinition, PartDefinition } from "@/config/character-assets"
import type { PartKey } from "@/types/character"

// Simple asset discovery that works in the browser
export function getCharacterParts(): PartDefinition[] {
  // Define the part configurations
  const partConfigs: Record<PartKey, {
    label: string
    icon: string
    category: "Body" | "Face" | "Hair" | "Accessories"
    folderPath: string
    defaultAsset: string
    optional: boolean
    knownAssets: string[] // List of known assets in this folder
  }> = {
    body: {
      label: "BODY",
      icon: "👤",
      category: "Body",
      folderPath: "body/body",
      defaultAsset: "default",
      optional: false,
      knownAssets: ["body-default.png"]
    },
    clothes: {
      label: "CLOTHES", 
      icon: "👕",
      category: "Body",
      folderPath: "body/clothes",
      defaultAsset: "default",
      optional: true,
      knownAssets: ["clothes-default.png"]
    },
    hairBehind: {
      label: "HAIR BEHIND",
      icon: "🎭", 
      category: "Hair",
      folderPath: "hair/hair-behind",
      defaultAsset: "default",
      optional: true,
      knownAssets: ["hair-behind-default.png"]
    },
    hairFront: {
      label: "HAIR FRONT",
      icon: "💇",
      category: "Hair", 
      folderPath: "hair/hair-front",
      defaultAsset: "default",
      optional: true,
      knownAssets: ["hair-front-default.png"]
    },
    eyes: {
      label: "EYES",
      icon: "👀",
      category: "Face",
      folderPath: "face/eyes", 
      defaultAsset: "default",
      optional: true,
      knownAssets: ["eyes-default.png"]
    },
    eyebrows: {
      label: "EYEBROWS",
      icon: "🤨",
      category: "Face",
      folderPath: "face/eyebrows",
      defaultAsset: "default", 
      optional: true,
      knownAssets: ["eyebrows-default.png"]
    },
    mouth: {
      label: "MOUTH",
      icon: "👄",
      category: "Face",
      folderPath: "face/mouth",
      defaultAsset: "default",
      optional: true,
      knownAssets: ["mouth-default.png"]
    },
    blush: {
      label: "BLUSH",
      icon: "😊",
      category: "Face", 
      folderPath: "face/blush",
      defaultAsset: "none",
      optional: true,
      knownAssets: ["blush-default.png"]
    },
    earring: {
      label: "EARRING",
      icon: "💎",
      category: "Accessories",
      folderPath: "accessories/earring",
      defaultAsset: "none",
      optional: true,
      knownAssets: ["earring-default.png"]
    },
    glasses: {
      label: "GLASSES",
      icon: "🤓", 
      category: "Accessories",
      folderPath: "accessories/glasses",
      defaultAsset: "none",
      optional: true,
      knownAssets: ["glasses-default.png"] // This will now be automatically included!
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

    // Add all known assets
    for (const filename of config.knownAssets) {
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
