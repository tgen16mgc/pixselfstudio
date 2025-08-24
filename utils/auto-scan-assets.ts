import { AssetDefinition, PartDefinition } from "@/config/character-assets"
import type { PartKey } from "@/types/character"

// Auto-scanning asset discovery that works by trying to load assets
export async function getCharacterPartsWithAutoScan(): Promise<PartDefinition[]> {
  // Define the part configurations
  const partConfigs: Record<PartKey, {
    label: string
    icon: string
    category: "Body" | "Face" | "Hair" | "Accessories"
    folderPath: string
    defaultAsset: string
    optional: boolean
    commonVariants: string[] // Common variants to check for
  }> = {
    body: {
      label: "BODY",
      icon: "👤",
      category: "Body",
      folderPath: "body/body",
      defaultAsset: "default",
      optional: false,
      commonVariants: ["default", "muscular", "slim", "chubby"]
    },
    clothes: {
      label: "CLOTHES", 
      icon: "👕",
      category: "Body",
      folderPath: "body/clothes",
      defaultAsset: "default",
      optional: true,
      commonVariants: ["default", "shirt", "dress", "hoodie", "jacket", "tank-top", "sweater"]
    },
    hairBehind: {
      label: "HAIR BEHIND",
      icon: "🎭", 
      category: "Hair",
      folderPath: "hair/hair-behind",
      defaultAsset: "default",
      optional: true,
      commonVariants: ["default", "short", "long", "curly", "ponytail"]
    },
    hairFront: {
      label: "HAIR FRONT",
      icon: "💇",
      category: "Hair", 
      folderPath: "hair/hair-front",
      defaultAsset: "default",
      optional: true,
      commonVariants: ["default", "short", "long", "curly", "spiky", "wavy"]
    },
    eyes: {
      label: "EYES",
      icon: "👀",
      category: "Face",
      folderPath: "face/eyes", 
      defaultAsset: "default",
      optional: true,
      commonVariants: ["default", "sleepy", "wide", "wink", "closed", "angry"]
    },
    eyebrows: {
      label: "EYEBROWS",
      icon: "🤨",
      category: "Face",
      folderPath: "face/eyebrows",
      defaultAsset: "default", 
      optional: true,
      commonVariants: ["default", "thick", "thin", "raised", "furrowed"]
    },
    mouth: {
      label: "MOUTH",
      icon: "👄",
      category: "Face",
      folderPath: "face/mouth",
      defaultAsset: "default",
      optional: true,
      commonVariants: ["default", "smile", "frown", "open", "laugh", "surprised"]
    },
    blush: {
      label: "BLUSH",
      icon: "😊",
      category: "Face", 
      folderPath: "face/blush",
      defaultAsset: "none",
      optional: true,
      commonVariants: ["default", "light", "medium", "heavy", "heart", "round", "oval"]
    },
    earring: {
      label: "EARRING",
      icon: "💎",
      category: "Accessories",
      folderPath: "accessories/earring",
      defaultAsset: "none",
      optional: true,
      commonVariants: ["default", "gold", "silver", "hoop", "stud", "drop"]
    },
    glasses: {
      label: "GLASSES",
      icon: "🤓", 
      category: "Accessories",
      folderPath: "accessories/glasses",
      defaultAsset: "none",
      optional: true,
      commonVariants: ["default", "sunglasses", "reading", "round", "square", "cat-eye"]
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

    // Check for common variants by trying to load them
    for (const variant of config.commonVariants) {
      const filename = `${partKey}-${variant}.png`
      const assetPath = `/assets/character/${config.folderPath}/${filename}`
      
      // Try to check if the asset exists
      const exists = await checkAssetExists(assetPath)
      if (exists) {
        const assetId = variant
        const assetName = variant === 'default' 
          ? `Default ${config.label}` 
          : variant.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        
        assets.push({
          id: assetId,
          name: assetName,
          path: assetPath,
          enabled: true,
        })
      }
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

// Function to check if an asset exists by trying to load it
async function checkAssetExists(assetPath: string): Promise<boolean> {
  try {
    const response = await fetch(assetPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
