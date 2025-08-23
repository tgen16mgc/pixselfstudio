// Centralized color variants configuration shared across components and utils

export const COLOR_VARIANTS = {
  hair: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  hairFront: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  hairBehind: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  body: {
    fair: "#FDBCB4",
    light: "#EEA990",
    medium: "#C68642",
    olive: "#8D5524",
    deep: "#654321",
    dark: "#3C2414",
  },
  clothes: {
    red: "#FF6B6B",
    blue: "#4ECDC4",
    green: "#45B7D1",
    yellow: "#96CEB4",
    purple: "#FFEAA7",
    orange: "#DDA0DD",
  },
  eyes: {
    brown: "#8B4513",
    blue: "#4169E1",
    green: "#228B22",
    gray: "#808080",
    purple: "#9370DB",
    red: "#DC143C",
  },
  mouth: {
    darkRed: "#DC143C",
    red: "#FF6347",
    mutedRed: "#CD5C5C",
    orange: "#FF8C00",
    pink: "#FF69B4",
    purple: "#9370DB",
  },
  eyebrows: {},
  blush: {},
  earring: {},
  glasses: {},
} as const

export type ColorVariantConfig = typeof COLOR_VARIANTS


