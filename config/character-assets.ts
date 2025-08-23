import type { AssetDefinition, PartDefinition } from "@/types/character"
import { assetRegistry, getCharacterParts, getAssetPath, getEnabledAssets } from "@/utils/asset-registry"

// Re-export types for convenience
export type { AssetDefinition, PartDefinition }

export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

// Function to get character parts (now uses the new asset registry)
export async function CHARACTER_PARTS(): Promise<PartDefinition[]> {
  return await getCharacterParts()
}

// Synchronous fallback for components that need immediate access
export function CHARACTER_PARTS_SYNC(): PartDefinition[] {
  // Return a minimal fallback for SSR/initial render
  // This will be replaced by the async version once loaded
  return FALLBACK_CHARACTER_PARTS
}

// Minimal fallback configuration for initial render
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
        basePath: "/assets/character/body/body",
        enabled: true,
        variants: [{
          id: "default",
          name: "Default",
          path: "/assets/character/body/body/body-default.png",
          enabled: true,
        }],
        defaultVariant: "default",
      }
    ],
    defaultAsset: "default",
    optional: false,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
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
        basePath: "",
        enabled: true,
        variants: [{
          id: "none",
          name: "None",
          path: "",
          enabled: true,
        }],
        defaultVariant: "none",
      }
    ],
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
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
export async function getPartByKey(key: PartKey): Promise<PartDefinition | undefined> {
  return await assetRegistry.getPart(key)
}

// Updated to support variants
export async function getAssetPath(partKey: PartKey, assetId: string, variantId?: string): Promise<string> {
  return await getAssetPath(partKey, assetId, variantId)
}

export async function getEnabledAssets(partKey: PartKey): Promise<AssetDefinition[]> {
  return await getEnabledAssets(partKey)
}

// Easy way to add new assets - now uses the registry
export async function addAssetToPart(partKey: PartKey, assetId: string, name: string, basePath: string, enabled = true): Promise<void> {
  // This would need to be implemented in the registry system
  // For now, assets should be added by placing files in the correct folders
  // and running the asset discovery process
  console.warn('addAssetToPart: Assets should be added by placing files in the correct folders and running asset discovery')
}

// Force refresh the asset cache (useful for development)
export async function refreshAssetCache(): Promise<void> {
  assetRegistry.clearCache()
}

// Export the registry for direct access when needed
export { assetRegistry }
