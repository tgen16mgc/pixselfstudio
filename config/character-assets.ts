import { getCharacterPartsFromManifest } from "@/utils/manifest-asset-discovery"

export type PartKey =
  | "body"
  | "hairBehind"
  | "clothes"
  | "mouth"
  | "eyes"
  | "eyebrows"
  | "hairFront"
  | "earring"
  | "glasses"
  | "blush"

export interface AssetDefinition {
  id: string
  name: string
  path: string
  enabled: boolean
}

export interface PartDefinition {
  key: PartKey
  label: string
  icon: string
  category: "Body" | "Face" | "Hair" | "Accessories"
  assets: AssetDefinition[]
  defaultAsset: string
  optional: boolean // If true, can be turned off (like earring)
}

// Automatically discover assets from filesystem
let _cachedParts: PartDefinition[] | null = null

export function CHARACTER_PARTS(): PartDefinition[] {
  // For now, return fallback parts - will be replaced by dynamic loading in components
  return FALLBACK_CHARACTER_PARTS
}

// Fallback manual configuration in case auto-discovery fails
const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [
  {
    key: "body",
    label: "BODY",
    icon: "👤",
    category: "Body",
    assets: [
      {
        id: "default",
        name: "Default BODY",
        path: "/assets/character/body/body/body-default.png",
        enabled: true,
      },
      {
        id: "v2",
        name: "V2 BODY",
        path: "/assets/character/body/body/body-v2.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: false,
  },
  {
    key: "clothes",
    label: "CLOTHES",
    icon: "👕",
    category: "Body",
    assets: [
      {
        id: "none",
        name: "No CLOTHES",
        path: "",
        enabled: true,
      },
      {
        id: "neu",
        name: "Neu CLOTHES",
        path: "/assets/character/body/clothes/clothes-neu.png",
        enabled: true,
      },
      {
        id: "somi",
        name: "Somi CLOTHES",
        path: "/assets/character/body/clothes/clothes-somi.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "hairBehind",
    label: "HAIR BEHIND",
    icon: "🎭",
    category: "Hair",
    assets: [
      {
        id: "none",
        name: "No HAIR BEHIND",
        path: "",
        enabled: true,
      },
      {
        id: "behind-2side",
        name: "Behind 2side HAIR BEHIND",
        path: "/assets/character/hair/hair-behind/hair-behind-2side.png",
        enabled: true,
      },
      {
        id: "behind-default",
        name: "Behind Default HAIR BEHIND",
        path: "/assets/character/hair/hair-behind/hair-behind-default.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "hairFront",
    label: "HAIR FRONT",
    icon: "💇",
    category: "Hair",
    assets: [
      {
        id: "none",
        name: "No HAIR FRONT",
        path: "",
        enabled: true,
      },
      {
        id: "front-2side",
        name: "Front 2side HAIR FRONT",
        path: "/assets/character/hair/hair-front/hair-front-2side.png",
        enabled: true,
      },
      {
        id: "front-64",
        name: "Front 64 HAIR FRONT",
        path: "/assets/character/hair/hair-front/hair-front-64.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "eyes",
    label: "EYES",
    icon: "👀",
    category: "Face",
    assets: [
      {
        id: "none",
        name: "No EYES",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default EYES",
        path: "/assets/character/face/eyes/eyes-default.png",
        enabled: true,
      },
      {
        id: "medium",
        name: "Medium EYES",
        path: "/assets/character/face/eyes/eyes-medium.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "eyebrows",
    label: "EYEBROWS",
    icon: "🤨",
    category: "Face",
    assets: [
      {
        id: "none",
        name: "No EYEBROWS",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default EYEBROWS",
        path: "/assets/character/face/eyebrows/eyebrows-default.png",
        enabled: true,
      },
      {
        id: "flat",
        name: "Flat EYEBROWS",
        path: "/assets/character/face/eyebrows/eyebrows-flat.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "mouth",
    label: "MOUTH",
    icon: "👄",
    category: "Face",
    assets: [
      {
        id: "none",
        name: "No MOUTH",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default MOUTH",
        path: "/assets/character/face/mouth/mouth-default.png",
        enabled: true,
      },
      {
        id: "smile1",
        name: "Smile1 MOUTH",
        path: "/assets/character/face/mouth/mouth-smile1.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "blush",
    label: "BLUSH",
    icon: "😊",
    category: "Face",
    assets: [
      {
        id: "none",
        name: "No BLUSH",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default BLUSH",
        path: "/assets/character/face/blush/blush-default.png",
        enabled: true,
      }
    ],
    defaultAsset: "none",
    optional: true,
  },
  {
    key: "earring",
    label: "EARRING",
    icon: "💎",
    category: "Accessories",
    assets: [
      {
        id: "none",
        name: "No EARRING",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default EARRING",
        path: "/assets/character/accessories/earring/earring-default.png",
        enabled: true,
      }
    ],
    defaultAsset: "none",
    optional: true,
  },
  {
    key: "glasses",
    label: "GLASSES",
    icon: "🤓",
    category: "Accessories",
    assets: [
      {
        id: "none",
        name: "No GLASSES",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default GLASSES",
        path: "/assets/character/accessories/glasses/glasses-default.png",
        enabled: true,
      }
    ],
    defaultAsset: "none",
    optional: true,
  }
];;;;;;;;;;;;;;

// Layering order (high to low z-index)
export const LAYER_ORDER: PartKey[] = [
  "glasses", // Highest layer - glasses go on top
  "earring", // Earring on top of most elements
  "hairFront",
  "eyebrows",
  "eyes",
  "mouth",
  "blush", // Blush on cheeks
  "clothes",
  "body",
  "hairBehind", // Lowest layer
]

// Helper functions for easy asset management
export function getPartByKey(key: PartKey): PartDefinition | undefined {
  return CHARACTER_PARTS().find((part) => part.key === key)
}

export function getAssetPath(partKey: PartKey, assetId: string): string {
  const part = getPartByKey(partKey)
  if (!part) return ""

  const asset = part.assets.find((a) => a.id === assetId)
  return asset?.path || ""
}

export function getEnabledAssets(partKey: PartKey): AssetDefinition[] {
  const part = getPartByKey(partKey)
  if (!part) return []

  return part.assets.filter((asset) => asset.enabled)
}

// Easy way to add new assets - just call this function
export function addAssetToPart(partKey: PartKey, assetId: string, name: string, path: string, enabled = true): void {
  const part = getPartByKey(partKey)
  if (part) {
    part.assets.push({
      id: assetId,
      name,
      path,
      enabled,
    })
  }
}

// Force refresh the asset cache (useful for development)
export function refreshAssetCache(): void {
  _cachedParts = null
}
