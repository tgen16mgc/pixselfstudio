import type { ColorPalette } from "@/types/character"

// Predefined color palettes for different character parts
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "hair",
    name: "Hair Colors",
    category: "hair",
    colors: [
      { id: "black", name: "Black", hex: "#2C1810", rgb: [44, 24, 16] },
      { id: "brown", name: "Brown", hex: "#8B4513", rgb: [139, 69, 19] },
      { id: "blonde", name: "Blonde", hex: "#DAA520", rgb: [218, 165, 32] },
      { id: "red", name: "Red", hex: "#DC143C", rgb: [220, 20, 60] },
      { id: "purple", name: "Purple", hex: "#9370DB", rgb: [147, 112, 219] },
      { id: "blue", name: "Blue", hex: "#00CED1", rgb: [0, 206, 209] },
      { id: "pink", name: "Pink", hex: "#F8BBD0", rgb: [248, 187, 208] },
      { id: "white", name: "White", hex: "#FAFAFA", rgb: [250, 250, 250] },
      { id: "yellow", name: "Yellow", hex: "#FFF9C4", rgb: [255, 249, 196] },
      { id: "wineRed", name: "Wine Red", hex: "#B56576", rgb: [181, 101, 118] },
    ]
  },
  {
    id: "skin",
    name: "Skin Colors",
    category: "skin",
    colors: [
      { id: "fair", name: "Fair", hex: "#FDBCB4", rgb: [253, 188, 180] },
      { id: "light", name: "Light", hex: "#EEA990", rgb: [238, 169, 144] },
      { id: "medium", name: "Medium", hex: "#C68642", rgb: [198, 134, 66] },
      { id: "olive", name: "Olive", hex: "#8D5524", rgb: [141, 85, 36] },
      { id: "deep", name: "Deep", hex: "#654321", rgb: [101, 67, 33] },
      { id: "dark", name: "Dark", hex: "#3C2414", rgb: [60, 36, 20] },
    ]
  },
  {
    id: "clothes",
    name: "Clothes Colors",
    category: "clothes",
    colors: [
      { id: "red", name: "Red", hex: "#FF6B6B", rgb: [255, 107, 107] },
      { id: "blue", name: "Blue", hex: "#4ECDC4", rgb: [78, 205, 196] },
      { id: "green", name: "Green", hex: "#45B7D1", rgb: [69, 183, 209] },
      { id: "yellow", name: "Yellow", hex: "#96CEB4", rgb: [150, 206, 180] },
      { id: "purple", name: "Purple", hex: "#FFEAA7", rgb: [255, 234, 167] },
      { id: "orange", name: "Orange", hex: "#DDA0DD", rgb: [221, 160, 221] },
      { id: "black", name: "Black", hex: "#2C2C2C", rgb: [44, 44, 44] },
      { id: "white", name: "White", hex: "#FFFFFF", rgb: [255, 255, 255] },
    ]
  },
  {
    id: "eyes",
    name: "Eye Colors",
    category: "eyes",
    colors: [
      { id: "brown", name: "Brown", hex: "#8B4513", rgb: [139, 69, 19] },
      { id: "blue", name: "Blue", hex: "#4169E1", rgb: [65, 105, 225] },
      { id: "green", name: "Green", hex: "#228B22", rgb: [34, 139, 34] },
      { id: "gray", name: "Gray", hex: "#808080", rgb: [128, 128, 128] },
      { id: "purple", name: "Purple", hex: "#9370DB", rgb: [147, 112, 219] },
      { id: "red", name: "Red", hex: "#DC143C", rgb: [220, 20, 60] },
    ]
  },
  {
    id: "accessories",
    name: "Accessory Colors",
    category: "accessories",
    colors: [
      { id: "gold", name: "Gold", hex: "#FFD700", rgb: [255, 215, 0] },
      { id: "silver", name: "Silver", hex: "#C0C0C0", rgb: [192, 192, 192] },
      { id: "black", name: "Black", hex: "#000000", rgb: [0, 0, 0] },
      { id: "white", name: "White", hex: "#FFFFFF", rgb: [255, 255, 255] },
      { id: "red", name: "Red", hex: "#FF0000", rgb: [255, 0, 0] },
      { id: "blue", name: "Blue", hex: "#0000FF", rgb: [0, 0, 255] },
    ]
  }
]

// Helper functions for color palette management
export function getColorPalette(category: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(palette => palette.category === category)
}

export function getColorById(paletteId: string, colorId: string): string | undefined {
  const palette = COLOR_PALETTES.find(p => p.id === paletteId)
  return palette?.colors.find(c => c.id === colorId)?.hex
}

export function getColorName(paletteId: string, colorId: string): string | undefined {
  const palette = COLOR_PALETTES.find(p => p.id === paletteId)
  return palette?.colors.find(c => c.id === colorId)?.name
}

// Get all available colors for a specific part
export function getAvailableColors(partKey: string): string[] {
  const colorMap: Record<string, string> = {
    hairFront: "hair",
    hairBehind: "hair",
    body: "skin",
    clothes: "clothes",
    eyes: "eyes",
    earring: "accessories",
    glasses: "accessories",
  }
  
  const paletteId = colorMap[partKey]
  if (!paletteId) return []
  
  const palette = getColorPalette(paletteId)
  return palette?.colors.map(c => c.id) || []
}