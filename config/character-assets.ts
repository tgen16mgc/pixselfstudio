import type { AssetDefinition, PartDefinition } from "@/types/character"

// Re-export types for convenience
export type { AssetDefinition, PartDefinition }

export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

// Function to get character parts (now returns fallback for client-side hook)
export function CHARACTER_PARTS(): PartDefinition[] {
  // For now, return fallback parts
  // In the future, this could be enhanced to read from a server-side manifest
  return FALLBACK_CHARACTER_PARTS
}

// Fallback manual configuration in case auto-discovery fails
const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [

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
      id: "aotheneu",
      name: "Aotheneu CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-aotheneu.png",
      enabled: true,
    },
    {
      id: "dress1",
      name: "Dress1 CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-dress1.png",
      enabled: true,
    },
    {
      id: "neu",
      name: "Neu CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-neu.png",
      enabled: true,
    },
    {
      id: "somi",
      name: "Somi CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-somi.png",
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
      id: "2side",
      name: "2side HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side.png",
      enabled: true,
    },
    {
      id: "64",
      name: "64 HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64.png",
      enabled: true,
    },
    {
      id: "long37",
      name: "Long37 HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37.png",
      enabled: true,
    },
    {
      id: "tomboy-brown",
      name: "Tomboy Brown HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-brown.png",
      enabled: true,
    },
    {
      id: "tomboy",
      name: "Tomboy HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy.png",
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
      id: "2side",
      name: "2side HAIR BEHIND",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side.png",
      enabled: true,
    },
    {
      id: "curly",
      name: "Curly HAIR BEHIND",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly.png",
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
      id: "basic1",
      name: "Basic1 EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-basic1.png",
      enabled: true,
    },
    {
      id: "default",
      name: "Default EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-default.png",
      enabled: true,
    },
    {
      id: "medium",
      name: "Medium EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-medium.png",
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
      id: "curved",
      name: "Curved EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-curved.png",
      enabled: true,
    },
    {
      id: "default",
      name: "Default EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-default.png",
      enabled: true,
    },
    {
      id: "flat",
      name: "Flat EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-flat.png",
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
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-default.png",
      enabled: true,
    },
    {
      id: "small",
      name: "Small MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-small.png",
      enabled: true,
    },
    {
      id: "smile-pink",
      name: "Smile Pink MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-smile-pink.png",
      enabled: true,
    },
    {
      id: "smile1",
      name: "Smile1 MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-smile1.png",
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
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-default.png",
      enabled: true,
    },
    {
      id: "light",
      name: "Light BLUSH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-light.png",
      enabled: true,
    },
    {
      id: "soft",
      name: "Soft BLUSH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-soft.png",
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
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/earring/earring-default.png",
      enabled: true,
    },
    {
      id: "helixmix",
      name: "Helixmix EARRING",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/earring/earring-helixmix.png",
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
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/glasses/glasses-default.png",
      enabled: true,
    }
    ],
    defaultAsset: "none",
    optional: true,
  }
]

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
let _cachedParts: PartDefinition[] | null = null

export function refreshAssetCache(): void {
  _cachedParts = null
}
