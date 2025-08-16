export const PIXSELF_BRAND = {
  // Core Brand Colors
  colors: {
    // Primary Brand Colors (from logo)
    primary: {
      gold: "#F4D03F", // Main logo gold/yellow
      goldDark: "#F1C40F", // Darker gold variant
      goldLight: "#F7DC6F", // Lighter gold variant
      navy: "#2C3E50", // Logo outline navy
      navyDark: "#1B2631", // Darker navy
      navyLight: "#34495E", // Lighter navy
    },

    // Sky Theme Colors (from backgrounds)
    sky: {
      primary: "#87CEEB", // Main sky blue
      light: "#B0E0E6", // Light sky blue
      bright: "#00BFFF", // Bright sky blue
      powder: "#B0C4DE", // Powder blue
      alice: "#F0F8FF", // Alice blue (very light)
    },

    // Cloud Colors
    cloud: {
      white: "#FFFFFF", // Pure white clouds
      light: "#F8F9FA", // Off-white
      shadow: "#E9ECEF", // Cloud shadows
    },

    // Accent Colors
    accent: {
      sparkle: "#FFD700", // Golden sparkles
      star: "#FFF700", // Bright star yellow
      highlight: "#FFFF99", // Soft highlight
    },

    // UI Colors
    ui: {
      success: "#27AE60",
      warning: "#F39C12",
      error: "#E74C3C",
      info: "#3498DB",
      muted: "#95A5A6",
    },
  },

  // Typography Scale
  typography: {
    // Pixel-perfect font sizes for retro feel
    sizes: {
      xs: "8px",
      sm: "10px",
      base: "12px",
      lg: "14px",
      xl: "16px",
      "2xl": "20px",
      "3xl": "24px",
      "4xl": "32px",
      "5xl": "40px",
    },

    // Font weights for pixel fonts
    weights: {
      normal: "400",
      bold: "700",
      black: "900",
    },
  },

  // Spacing System (pixel-perfect)
  spacing: {
    px: "1px",
    0.5: "2px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
  },

  // Border Radius (pixel-style)
  borderRadius: {
    none: "0px",
    sm: "2px",
    base: "4px",
    lg: "8px",
    pixel: "0px", // For true pixel art feel
  },

  // Shadows (pixel-style)
  shadows: {
    pixel: "2px 2px 0px rgba(44, 62, 80, 0.8)",
    pixelLarge: "4px 4px 0px rgba(44, 62, 80, 0.8)",
    glow: "0 0 20px rgba(244, 208, 63, 0.6)",
    glowStrong: "0 0 30px rgba(244, 208, 63, 0.8)",
  },

  // Animation Durations
  animation: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
  },
} as const

// Brand Voice & Personality
export const BRAND_VOICE = {
  personality: [
    "Nostalgic & Retro",
    "Playful & Creative",
    "Accessible & Friendly",
    "Magical & Dreamy",
    "Empowering & Personal",
  ],

  tone: [
    "Encouraging creativity",
    "Celebrating individuality",
    "Evoking childhood wonder",
    "Building confidence",
    "Fostering self-expression",
  ],

  messaging: {
    tagline: "Create Your Pixel Self",
    mission: "Empowering everyone to express their unique identity through the art of pixels",
    vision: "A world where everyone can see themselves represented in the digital realm",
  },
} as const

// Component Variants
export const BRAND_COMPONENTS = {
  button: {
    primary: {
      bg: PIXSELF_BRAND.colors.primary.gold,
      color: PIXSELF_BRAND.colors.primary.navy,
      border: PIXSELF_BRAND.colors.primary.navy,
      shadow: PIXSELF_BRAND.shadows.pixel,
    },
    secondary: {
      bg: PIXSELF_BRAND.colors.sky.primary,
      color: PIXSELF_BRAND.colors.primary.navy,
      border: PIXSELF_BRAND.colors.primary.navy,
      shadow: PIXSELF_BRAND.shadows.pixel,
    },
    accent: {
      bg: PIXSELF_BRAND.colors.accent.sparkle,
      color: PIXSELF_BRAND.colors.primary.navy,
      border: PIXSELF_BRAND.colors.primary.navy,
      shadow: PIXSELF_BRAND.shadows.pixelLarge,
    },
  },

  panel: {
    primary: {
      bg: "rgba(240, 248, 255, 0.95)", // Alice blue with transparency
      border: PIXSELF_BRAND.colors.primary.navy,
      shadow: PIXSELF_BRAND.shadows.pixelLarge,
    },
    secondary: {
      bg: "rgba(176, 224, 230, 0.90)", // Light sky blue with transparency
      border: PIXSELF_BRAND.colors.primary.navyLight,
      shadow: PIXSELF_BRAND.shadows.pixel,
    },
  },
} as const
