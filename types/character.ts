export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

export interface PartSelection {
  assetId: string
  enabled: boolean
}

export type Selections = Record<PartKey, PartSelection>

export interface PartDefinition {
  key: PartKey
  label: string
  icon: string
  category: "Head" | "Face" | "Body" | "Hair" | "Accessories"
  assets: AssetDefinition[]
  defaultAsset: string
  optional: boolean
}

export interface AssetVariant {
  id: string
  name: string
  path?: string
  color?: string
  enabled: boolean
}

export interface AssetDefinition {
  id: string
  name: string
  path?: string
  enabled: boolean
  defaultVariant?: string
  variants?: AssetVariant[]
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

export interface StyleInfo {
  id: string
  name: string
}

export interface ExportOptions {
  size: "small" | "medium" | "large"
  format: "png" | "svg"
  includeBackground: boolean
}
