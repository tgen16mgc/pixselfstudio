export const CLASSIC_8BIT_COLORS = {
  // NES-inspired palette
  nes: {
    black: "#0F0F0F",
    darkGray: "#2A2A2A",
    gray: "#5F5F5F",
    lightGray: "#9F9F9F",
    white: "#FFFFFF",
    darkBlue: "#002A88",
    blue: "#0039BC",
    lightBlue: "#0085FF",
    cyan: "#00D4AA",
    darkGreen: "#00A800",
    green: "#58F898",
    darkRed: "#A80020",
    red: "#F85898",
    darkYellow: "#A85400",
    yellow: "#FFFF00",
    orange: "#FF8800",
    purple: "#8800BC",
    magenta: "#FF00FF",
  },

  // Game Boy green palette
  gameboy: {
    darkest: "#0F380F",
    dark: "#306230",
    light: "#8BAC0F",
    lightest: "#9BBD0F",
  },

  // C64 palette
  c64: {
    black: "#000000",
    white: "#FFFFFF",
    red: "#68372B",
    cyan: "#70A4B2",
    purple: "#6F3D86",
    green: "#588D43",
    blue: "#352879",
    yellow: "#B8C76F",
    orange: "#6F4F25",
    brown: "#433900",
    lightRed: "#9A6759",
    darkGray: "#444444",
    gray: "#6C6C6C",
    lightGreen: "#9AD284",
    lightBlue: "#6C5EB5",
    lightGray: "#959595",
  },
} as const

// 8-bit character color palettes using authentic retro colors
export const RETRO_CHARACTER_PALETTES = {
  hair: [
    CLASSIC_8BIT_COLORS.nes.black, // Black
    CLASSIC_8BIT_COLORS.c64.brown, // Brown
    CLASSIC_8BIT_COLORS.nes.darkYellow, // Dark Blonde
    CLASSIC_8BIT_COLORS.nes.yellow, // Blonde
    CLASSIC_8BIT_COLORS.nes.lightGray, // Silver
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
  ],

  head: [
    CLASSIC_8BIT_COLORS.c64.lightRed, // Fair
    CLASSIC_8BIT_COLORS.nes.orange, // Light
    CLASSIC_8BIT_COLORS.nes.darkYellow, // Medium
    CLASSIC_8BIT_COLORS.c64.brown, // Olive
    CLASSIC_8BIT_COLORS.nes.darkRed, // Deep
    CLASSIC_8BIT_COLORS.nes.darkGray, // Dark
  ],

  eyes: [
    CLASSIC_8BIT_COLORS.c64.brown, // Brown
    CLASSIC_8BIT_COLORS.nes.blue, // Blue
    CLASSIC_8BIT_COLORS.nes.darkGreen, // Green
    CLASSIC_8BIT_COLORS.nes.gray, // Gray
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
    CLASSIC_8BIT_COLORS.nes.red, // Red
  ],

  eyebrows: [
    CLASSIC_8BIT_COLORS.nes.black, // Black
    CLASSIC_8BIT_COLORS.c64.brown, // Brown
    CLASSIC_8BIT_COLORS.nes.darkYellow, // Dark Blonde
    CLASSIC_8BIT_COLORS.nes.darkGray, // Gray
    CLASSIC_8BIT_COLORS.nes.darkRed, // Dark Red
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
  ],

  mouth: [
    CLASSIC_8BIT_COLORS.nes.darkRed, // Dark Red
    CLASSIC_8BIT_COLORS.nes.red, // Red
    CLASSIC_8BIT_COLORS.c64.red, // Muted Red
    CLASSIC_8BIT_COLORS.nes.orange, // Orange
    CLASSIC_8BIT_COLORS.nes.magenta, // Pink
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
  ],

  blush: [
    CLASSIC_8BIT_COLORS.nes.magenta, // Pink
    CLASSIC_8BIT_COLORS.nes.red, // Red
    CLASSIC_8BIT_COLORS.c64.red, // Muted Red
    CLASSIC_8BIT_COLORS.nes.orange, // Orange
    CLASSIC_8BIT_COLORS.nes.darkRed, // Dark Red
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
  ],

  body: [
    CLASSIC_8BIT_COLORS.c64.lightRed, // Fair
    CLASSIC_8BIT_COLORS.nes.orange, // Light
    CLASSIC_8BIT_COLORS.nes.darkYellow, // Medium
    CLASSIC_8BIT_COLORS.c64.brown, // Olive
    CLASSIC_8BIT_COLORS.nes.darkRed, // Deep
    CLASSIC_8BIT_COLORS.nes.darkGray, // Dark
  ],

  costume: [
    CLASSIC_8BIT_COLORS.nes.red, // Red
    CLASSIC_8BIT_COLORS.nes.blue, // Blue
    CLASSIC_8BIT_COLORS.nes.darkGreen, // Green
    CLASSIC_8BIT_COLORS.nes.yellow, // Yellow
    CLASSIC_8BIT_COLORS.nes.purple, // Purple
    CLASSIC_8BIT_COLORS.nes.orange, // Orange
  ],

  shoes: [
    CLASSIC_8BIT_COLORS.nes.black, // Black
    CLASSIC_8BIT_COLORS.c64.brown, // Brown
    CLASSIC_8BIT_COLORS.nes.darkGray, // Dark Gray
    CLASSIC_8BIT_COLORS.nes.darkBlue, // Dark Blue
    CLASSIC_8BIT_COLORS.nes.darkRed, // Dark Red
    CLASSIC_8BIT_COLORS.nes.darkGreen, // Dark Green
  ],
}

// 8-bit UI theme colors - Updated with sage green palette inspired by the provided image
export const RETRO_UI_THEME = {
  background: {
    primary: "rgba(25, 35, 25, 0.85)", // Dark forest green, semi-transparent
    secondary: "rgba(45, 60, 45, 0.80)", // Medium forest green, semi-transparent
    tertiary: "rgba(70, 90, 70, 0.75)", // Lighter forest green, semi-transparent
  },

  accent: {
    primary: "#7BA05B", // Sage green (main accent color from the image)
    secondary: "#9BC53D", // Brighter lime green
    warning: "#E6B800", // Golden yellow (like the coin in the image)
    error: "#C85450", // Muted red
    success: "#6B8E23", // Olive green
  },

  text: {
    primary: "#F0F8E8", // Very light sage/cream
    secondary: "#D4E4C8", // Light sage green
    muted: "#A8C090", // Medium sage green
    accent: "#7BA05B", // Sage green accent
  },

  border: {
    primary: "#7BA05B", // Sage green (main border color)
    secondary: "#A8C090", // Medium sage green
    muted: "#5A7A45", // Darker sage green
  },
} as const
