export const CHARACTER_CONFIG = {
  canvas: {
    width: 64,
    height: 80,
    defaultScale: 6,
    minZoom: 0.5,
    maxZoom: 2,
    zoomStep: 0.25,
  },

  history: {
    maxSize: 50,
    cleanupThreshold: 100,
  },

  animation: {
    targetFPS: 60,
    floatAmplitude: 2,
    floatSpeed: 0.02,
  },

  export: {
    sizes: {
      small: 6,
      medium: 12,
      large: 24,
    },
    formats: ["png", "svg"] as const,
  },

  storage: {
    keys: {
      selections: "pixel-character-data",
      history: "pixel-character-history",
      settings: "pixel-character-settings",
      tourSeen: "pixel-character-tour-seen",
    },
  },

  parts: {
    maxVariants: 10,
    categories: ["Head", "Face", "Body"] as const,
  },
} as const

export type CharacterConfig = typeof CHARACTER_CONFIG
