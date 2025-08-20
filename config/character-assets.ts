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

// Asset definitions - Easy to expand by adding new assets to each part
export const CHARACTER_PARTS: PartDefinition[] = [
  {
    key: "body",
    label: "BODY",
    icon: "👤",
    category: "Body",
    assets: [
      {
        id: "default",
        name: "Default Body",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body.png",
        enabled: true,
      },
      // Add more body assets here in the future
    ],
    defaultAsset: "default",
    optional: false,
  },
  {
    key: "hairBehind",
    label: "HAIR BEHIND",
    icon: "🎭",
    category: "Hair",
    assets: [
      {
        id: "none",
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Hair Behind",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair-behind.png",
        enabled: true,
      },
      // Add more hair behind assets here
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "clothes",
    label: "CLOTHES",
    icon: "👕",
    category: "Body",
    assets: [
      {
        id: "none",
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Clothes",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/clothes.png",
        enabled: true,
      },
      // Add more clothing assets here
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
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Mouth",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/mouth.png",
        enabled: true,
      },
      // Add more mouth assets here
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
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Eyes",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/eyes.png",
        enabled: true,
      },
      // Add more eye assets here
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
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Eyebrows",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/eyebrows.png",
        enabled: true,
      },
      // Add more eyebrow assets here
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
        name: "None",
        path: "",
        enabled: true,
      },
      {
        id: "default",
        name: "Default Hair Front",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair-front.png",
        enabled: true,
      },
      // Add more hair front assets here
    ],
    defaultAsset: "default",
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
        name: "No Earring",
        path: "", // Empty path means no asset
        enabled: true,
      },
      // Add earring assets here when available
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
        name: "No Glasses",
        path: "", // Empty path means no asset
        enabled: true,
      },
      // Add glasses assets here when available
    ],
    defaultAsset: "none",
    optional: true,
  },
]

// Layering order (high to low z-index)
export const LAYER_ORDER: PartKey[] = [
  "glasses", // Highest layer - glasses go on top
  "hairFront",
  "eyebrows",
  "eyes",
  "mouth",
  "clothes",
  "body",
  "hairBehind", // Lowest layer
  "earring", // Can be positioned as needed
]

// Helper functions for easy asset management
export function getPartByKey(key: PartKey): PartDefinition | undefined {
  return CHARACTER_PARTS.find((part) => part.key === key)
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
