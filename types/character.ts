export type PartKey = "hair" | "head" | "eyes" | "eyebrows" | "mouth" | "body" | "costume"

export interface PartSelection {
  variant: number
  color: number
}

export type Selections = Record<PartKey, PartSelection>

export interface PartDefinition {
  key: PartKey
  label: string
  icon: string
  pixelIcon: string
  category: "Head" | "Face" | "Body"
  maxVariants: number
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
