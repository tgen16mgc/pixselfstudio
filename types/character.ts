export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

export interface PartSelection {
  assetId: string
  enabled: boolean
  colorVariant?: string // New: specific color variant selection
}

export type Selections = Record<PartKey, PartSelection>

// New: Hierarchical asset structure
export interface AssetVariant {
  id: string
  name: string
  color?: string
  path: string
  enabled: boolean
  metadata?: {
    tags?: string[]
    description?: string
    author?: string
    version?: string
  }
}

export interface AssetDefinition {
  id: string
  name: string
  basePath: string
  enabled: boolean
  variants: AssetVariant[]
  defaultVariant: string
  metadata?: {
    category?: string
    tags?: string[]
    description?: string
    author?: string
    version?: string
    compatibleWith?: PartKey[]
  }
}

export interface PartDefinition {
  key: PartKey
  label: string
  icon: string
  category: "Head" | "Face" | "Body" | "Hair" | "Accessories"
  assets: AssetDefinition[]
  defaultAsset: string
  optional: boolean
  colorSupport?: boolean // New: indicates if this part supports color variants
  colorPalette?: string[] // New: predefined color options for this part
}

// New: Asset registry interface for dynamic discovery
export interface AssetRegistry {
  version: string
  generated: string
  parts: Record<PartKey, PartDefinition>
  metadata: {
    totalAssets: number
    totalVariants: number
    lastUpdated: string
  }
}

// New: Asset discovery result
export interface AssetDiscoveryResult {
  success: boolean
  parts: PartDefinition[]
  errors: string[]
  warnings: string[]
  metadata: {
    scannedFolders: number
    discoveredAssets: number
    discoveredVariants: number
  }
}

// New: Color palette definitions
export interface ColorPalette {
  id: string
  name: string
  colors: {
    id: string
    name: string
    hex: string
    rgb: [number, number, number]
  }[]
  category: "hair" | "skin" | "clothes" | "eyes" | "accessories"
}

export interface CharacterStats {
  Strength: number
  Magic: number
  Speed: number
  Defense: number
  Luck: number
}

export interface HistoryState {
  selections: Selections
  timestamp: number
  id: string
}

export interface ExportOptions {
  size: "small" | "medium" | "large"
  format: "png" | "svg"
  includeBackground: boolean
}
