"use client"

import { useState, useEffect, useMemo } from "react"
import { Settings, Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey, AssetDefinition } from "@/types/character"
import { getExistingColorVariants } from "@/utils/asset-existence-checker"

interface StyleAndColorSelectorProps {
  activePart: PartKey
  currentAssetId: string
  onAssetSelect: (assetId: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

// Color variants for different parts
const COLOR_VARIANTS = {
  hair: {
    black: "#333333",
    white: "#FAFAFA", 
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513"
  },
  body: {
    fair: "#FDBCB4",
    light: "#EEA990",
    medium: "#C68642", 
    olive: "#8D5524",
    deep: "#654321",
    dark: "#3C2414"
  },
  clothes: {
    red: "#FF6B6B",
    blue: "#4ECDC4",
    green: "#45B7D1",
    yellow: "#96CEB4", 
    purple: "#FFEAA7",
    orange: "#DDA0DD"
  },
  eyes: {
    brown: "#8B4513",
    blue: "#4169E1",
    green: "#228B22",
    gray: "#808080",
    purple: "#9370DB",
    red: "#DC143C"
  },
  mouth: {
    darkRed: "#DC143C",
    red: "#FF6347",
    mutedRed: "#CD5C5C",
    orange: "#FF8C00",
    pink: "#FF69B4",
    purple: "#9370DB"
  }
}

// Helper function to extract base style from asset ID
function getBaseStyleId(assetId: string): string {
  // Remove color suffixes to get base style
  const colorSuffixes = Object.keys(COLOR_VARIANTS.hair) // Use hair as it has most colors
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return assetId.slice(0, -(color.length + 1))
    }
  }
  return assetId
}

// Helper function to get color from asset ID
function getColorFromAssetId(assetId: string): string | null {
  const colorSuffixes = Object.keys(COLOR_VARIANTS.hair)
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return color
    }
  }
  return null
}

export function StyleAndColorSelector({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
}: StyleAndColorSelectorProps) {
  const [availableColorVariants, setAvailableColorVariants] = useState<Record<string, AssetDefinition[]>>({})
  const [selectedBaseStyle, setSelectedBaseStyle] = useState<string>("")

  const part = CHARACTER_PARTS().find((p) => p.key === activePart)

  // Get base styles (filter out color variants and group by base)
  const baseStyles = useMemo(() => {
    if (!part) return []
    
    const styles = new Map<string, AssetDefinition>()
    
    for (const asset of part.assets) {
      const baseId = getBaseStyleId(asset.id)
      
      // If this is a base asset (no color suffix) or we haven't seen this base yet
      if (!getColorFromAssetId(asset.id) || !styles.has(baseId)) {
        styles.set(baseId, {
          ...asset,
          id: baseId,
          // Remove color information from the name if present
          name: asset.name.replace(/\s*\([^)]+\)$/, "")
        })
      }
    }
    
    return Array.from(styles.values())
  }, [part?.assets, part])

  // Determine current selected base style
  useEffect(() => {
    const currentBaseStyle = getBaseStyleId(currentAssetId)
    setSelectedBaseStyle(currentBaseStyle)
  }, [currentAssetId])

  // Load available color variants for each base style
  useEffect(() => {
    if (!part || baseStyles.length === 0) return
    
    const loadColorVariants = async () => {
      const variants: Record<string, AssetDefinition[]> = {}
      const colorVariantsConfig = COLOR_VARIANTS[activePart as keyof typeof COLOR_VARIANTS] || COLOR_VARIANTS.hair

      for (const baseStyle of baseStyles) {
        if (baseStyle.id === "none") {
          variants[baseStyle.id] = []
          continue
        }

        try {
          const existingVariants = await getExistingColorVariants(baseStyle, colorVariantsConfig)
          variants[baseStyle.id] = existingVariants
        } catch (error) {
          console.warn(`Failed to load color variants for ${baseStyle.id}:`, error)
          variants[baseStyle.id] = []
        }
      }

      setAvailableColorVariants(variants)
    }

    loadColorVariants()
  }, [baseStyles, activePart, part])

  if (!part) return null

  // Don't show color variants for accessories
  const showColorVariants = !["earring", "glasses", "eyebrows", "blush"].includes(activePart)

  const handleBaseStyleSelect = (styleId: string) => {
    setSelectedBaseStyle(styleId)
    
    // If this style has color variants, select the first available one
    const colorVariants = availableColorVariants[styleId] || []
    if (colorVariants.length > 0) {
      onAssetSelect(colorVariants[0].id)
    } else {
      // No color variants, select the base style
      onAssetSelect(styleId)
    }
  }

  const handleColorVariantSelect = (variantId: string) => {
    onAssetSelect(variantId)
  }

  const selectedColorVariants = availableColorVariants[selectedBaseStyle] || []

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Style Options - Mobile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              STYLE OPTIONS
            </div>
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="flex items-stretch gap-2 min-w-max px-1">
              {baseStyles.map((style) => {
                const isSelected = selectedBaseStyle === style.id
                
                return (
                  <button
                    key={style.id}
                    onClick={() => handleBaseStyleSelect(style.id)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-3 border-2 text-[8px] font-bold backdrop-blur-sm transition-all duration-200 min-w-[80px] disabled:opacity-50"
                    style={{
                      backgroundColor: isSelected
                        ? PIXSELF_BRAND.colors.primary.gold
                        : PIXSELF_BRAND.colors.cloud.light,
                      color: PIXSELF_BRAND.colors.primary.navy,
                      borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                      imageRendering: "pixelated",
                      outline: isSelected ? `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}` : "none",
                    }}
                  >
                    {/* Asset Preview */}
                    <div
                      className="w-12 h-12 border-2 flex items-center justify-center"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                      }}
                    >
                      {style.id === "none" ? (
                        <span className="text-[10px]">✕</span>
                      ) : style.path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={style.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                          alt={style.name}
                          className="w-full h-full object-contain"
                          style={{
                            imageRendering: "pixelated",
                            transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                          }}
                        />
                      ) : (
                        <span className="text-[10px]">?</span>
                      )}
                    </div>
                    
                    {/* Asset Name */}
                    <span className="text-center leading-tight">{style.name}</span>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Color Variants - Mobile */}
        {showColorVariants && selectedColorVariants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
              <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                COLOR VARIANTS
              </div>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex items-stretch gap-2 min-w-max px-1">
                {selectedColorVariants.map((variant) => {
                  const isSelected = currentAssetId === variant.id
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleColorVariantSelect(variant.id)}
                      disabled={isLoading}
                      className="flex flex-col items-center gap-2 p-2 border-2 backdrop-blur-sm transition-all duration-200 min-w-[60px] disabled:opacity-50"
                      style={{
                        backgroundColor: isSelected
                          ? PIXSELF_BRAND.colors.primary.gold
                          : PIXSELF_BRAND.colors.cloud.light,
                        borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                        boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 border-2 rounded-full"
                        style={{
                          backgroundColor: variant.color || "#666",
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                        }}
                      />
                      <span
                        className="text-[6px] font-bold text-center"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        {getColorFromAssetId(variant.id)?.toUpperCase()}
                      </span>
                      {isSelected && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      {/* Style Options - Desktop */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            STYLE OPTIONS
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {baseStyles.map((style) => {
            const isSelected = selectedBaseStyle === style.id
            
            return (
              <button
                key={style.id}
                onClick={() => handleBaseStyleSelect(style.id)}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-3 border-2 text-[8px] font-bold backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: isSelected
                    ? PIXSELF_BRAND.colors.primary.gold
                    : PIXSELF_BRAND.colors.cloud.light,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                  imageRendering: "pixelated",
                  outline: isSelected ? `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}` : "none",
                }}
              >
                {/* Asset Preview */}
                <div
                  className="w-16 h-16 border-2 flex items-center justify-center"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                    borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  }}
                >
                  {style.id === "none" ? (
                    <span className="text-[12px]">✕</span>
                  ) : style.path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={style.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                      alt={style.name}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "pixelated",
                        transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                      }}
                    />
                  ) : (
                    <span className="text-[12px]">?</span>
                  )}
                </div>
                
                {/* Asset Name */}
                <span className="text-center leading-tight">{style.name}</span>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Color Variants - Desktop */}
      {showColorVariants && selectedColorVariants.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              COLOR VARIANTS
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {selectedColorVariants.map((variant) => {
              const isSelected = currentAssetId === variant.id
              
              return (
                <button
                  key={variant.id}
                  onClick={() => handleColorVariantSelect(variant.id)}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-3 border-2 backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.gold
                      : PIXSELF_BRAND.colors.cloud.light,
                    borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                    boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                  }}
                >
                  <div
                    className="w-10 h-10 border-2 rounded-full"
                    style={{
                      backgroundColor: variant.color || "#666",
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                    }}
                  />
                  <span className="text-[8px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    {getColorFromAssetId(variant.id)?.replace(/([A-Z])/g, ' $1').trim().toUpperCase() || "DEFAULT"}
                  </span>
                  {isSelected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}