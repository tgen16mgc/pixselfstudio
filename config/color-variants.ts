/**
 * New Dynamic Color Variants System
 * 
 * This system allows for each style to have its own custom color variants.
 * Color variants are discovered dynamically based on file naming conventions.
 */

/**
 * Standard color palette with hex codes for common colors
 * This serves as a reference for standard colors but isn't strictly tied to assets
 */
export const STANDARD_COLORS: Record<string, string> = {
  // Neutral colors
  black: "#333333",
  white: "#FAFAFA",
  gray: "#808080",
  
  // Hair colors
  blonde: "#F0E68C",
  brown: "#8B4513",
  auburn: "#A52A2A",
  
  // Vibrant colors
  red: "#FF6347",
  pink: "#FF69B4",
  orange: "#FFA500",
  yellow: "#FFD700",
  green: "#228B22",
  blue: "#4169E1",
  purple: "#9370DB",
  
  // Skin tones
  fair: "#FDBCB4",
  light: "#EEA990",
  medium: "#C68642",
  olive: "#8D5524",
  deep: "#654321",
  dark: "#3C2414",
}

/**
 * Human-readable color names
 */
export const COLOR_DISPLAY_NAMES: Record<string, string> = {
  black: "Black",
  white: "White", 
  gray: "Gray",
  blonde: "Blonde",
  brown: "Brown",
  auburn: "Auburn",
  red: "Red",
  pink: "Pink",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  fair: "Fair",
  light: "Light",
  medium: "Medium",
  olive: "Olive",
  deep: "Deep",
  dark: "Dark",
  
  // Add custom color name mappings here
  darkRed: "Dark Red",
  lightBlue: "Light Blue",
  pastelPink: "Pastel Pink",
  navy: "Navy Blue",
  wineRed: "Wine Red",
  mutedRed: "Muted Red"
}

/**
 * Get the display name for a color
 */
export function getColorDisplayName(colorKey: string): string {
  return COLOR_DISPLAY_NAMES[colorKey] || 
    colorKey.replace(/([A-Z])/g, ' $1') // Convert camelCase to Title Case
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}



