"use client"

import { useState, useEffect, useMemo } from "react"
import { Settings, Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { COLOR_VARIANTS } from "@/config/color-variants"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey, AssetDefinition, AssetVariant } from "@/types/character"
import { getExistingColorVariants } from "@/utils/asset-existence-checker"

interface StyleAndColorSelectorProps {
  activePart: PartKey
  currentAssetId: string
  onAssetSelect: (assetId: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

// COLOR_VARIANTS now imported from a single source

// Helper function to extract base style from asset ID
function getBaseStyleId(assetId: string, partKey?: PartKey): string {
  // Special case for smile1-pink (and potentially other similar cases)
  if (assetId === "smile1-pink") {
    return "smile1"
  }
  
  // Special case for tomboy-brown (when it's a base asset, not a color variant)
  if (assetId === "tomboy-brown") {
    return "tomboy"
  }
  
  // Get the appropriate color variants for this part
  const colorVariants = partKey ? COLOR_VARIANTS[partKey as keyof typeof COLOR_VARIANTS] : COLOR_VARIANTS.hair
  const colorSuffixes = Object.keys(colorVariants)
  
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return assetId.slice(0, -(color.length + 1))
    }
  }
  return assetId
}

// Helper function to get color from asset ID
function getColorFromAssetId(assetId: string, partKey?: PartKey): string | null {
  // Special case for smile1-pink
  if (assetId === "smile1-pink") {
    return "pink"
  }
  
  // Special case for tomboy-brown (when it's a base asset, not a color variant)
  if (assetId === "tomboy-brown") {
    return "brown"
  }
  
  // Get the appropriate color variants for this part
  const colorVariants = partKey ? COLOR_VARIANTS[partKey as keyof typeof COLOR_VARIANTS] : COLOR_VARIANTS.hair
  const colorSuffixes = Object.keys(colorVariants)
  
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return color
    }
  }
  
  // If no color variant is found, return "default" for non-empty assets
  return assetId !== "none" && assetId !== "" ? "default" : null
}

export function StyleAndColorSelector({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
}: StyleAndColorSelectorProps) {
  const [availableColorVariants, setAvailableColorVariants] = useState<Record<string, AssetVariant[]>>({})
  const [selectedBaseStyle, setSelectedBaseStyle] = useState<string>("")
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)

  const part = CHARACTER_PARTS().find((p) => p.key === activePart)

  // Get base styles (filter out color variants and group by base)
  const baseStyles = useMemo(() => {
    if (!part) return []
    
    const styles = new Map<string, AssetDefinition>()
    
    for (const asset of part.assets) {
      const baseId = getBaseStyleId(asset.id, activePart)
      const colorFromId = getColorFromAssetId(asset.id, activePart)
      const isColorVariant = colorFromId && colorFromId !== "default"
      
      // Always prioritize base assets over color variants
      if (!isColorVariant) {
        // This is a base asset, always include it (overriding any color variant)
        styles.set(baseId, {
          ...asset,
          id: baseId,
          // Remove color information from the name if present
          name: asset.name.replace(/\s*\([^)]+\)$/, "")
        })
      } else if (!styles.has(baseId)) {
        // This is a color variant, only include if we haven't seen the base yet
        styles.set(baseId, {
          ...asset,
          id: baseId,
          // Remove color information from the name if present
          name: asset.name.replace(/\s*\([^)]+\)$/, "")
        })
      }
    }
    
    return Array.from(styles.values())
  }, [part, activePart])

  // Determine current selected base style
  useEffect(() => {
    const currentBaseStyle = getBaseStyleId(currentAssetId, activePart)
    setSelectedBaseStyle(currentBaseStyle)
  }, [currentAssetId, activePart])

  // Load available color variants for each base style
  useEffect(() => {
    if (!part || baseStyles.length === 0) return
    
    // Clear previous variants first to avoid showing stale data
    setAvailableColorVariants({})
    setIsLoadingVariants(true)
    
    // Add a small delay to ensure the component has time to re-render
    const timeoutId = setTimeout(async () => {
      const variants: Record<string, AssetVariant[]> = {}
      const colorVariantsConfig = COLOR_VARIANTS[activePart as keyof typeof COLOR_VARIANTS] || {}

      console.log(`🎨 Loading color variants for ${activePart} part with ${baseStyles.length} base styles`)

      for (const baseStyle of baseStyles) {
        if (baseStyle.id === "none") {
          variants[baseStyle.id] = []
          continue
        }

        // Skip color variant loading for parts that don't have color variants
        if (Object.keys(colorVariantsConfig).length === 0) {
          variants[baseStyle.id] = []
          continue
        }

        try {
          const existingVariants = await getExistingColorVariants(baseStyle, colorVariantsConfig)
          variants[baseStyle.id] = existingVariants
          
          // Log for debugging tomboy specifically
          if (baseStyle.id === 'tomboy') {
            console.log(`🎯 Tomboy variants loaded:`, existingVariants.length, 'variants')
            console.log(`🎯 Tomboy variant paths:`, existingVariants.map(v => v.path))
          }
          
          // Log for debugging smile1 specifically
          if (baseStyle.id === 'smile1') {
            console.log(`🎯 Smile1 variants loaded:`, existingVariants.length, 'variants')
            console.log(`🎯 Smile1 variant paths:`, existingVariants.map(v => v.path))
          }
        } catch (error) {
          console.warn(`Failed to load color variants for ${baseStyle.id}:`, error)
          variants[baseStyle.id] = []
        }
      }

      console.log(`🎨 Color variants loaded for ${activePart}:`, 
        Object.entries(variants).map(([id, vars]) => `${id}: ${vars.length}`))
      
      setAvailableColorVariants(variants)
      setIsLoadingVariants(false)
    }, 300) // Small delay to ensure component stability
    
    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timeoutId)
  }, [baseStyles, activePart, part])

  if (!part) return null

  // Don't show color variants for accessories
  const showColorVariants = !["earring", "glasses", "eyebrows", "blush"].includes(activePart)

  const handleBaseStyleSelect = (styleId: string) => {
    setSelectedBaseStyle(styleId)
    
    // If this style has color variants, select the first available one
    const variants = availableColorVariants[styleId] || []
    if (variants.length > 0) {
      onAssetSelect(variants[0].id)
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
                      ) : (style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                          alt={style.name}
                          className="w-full h-full object-contain"
                          style={{
                            imageRendering: "pixelated",
                            transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                          }}
                          onError={(e) => {
                            const p = (style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path
                            console.error(`Failed to load image: ${p}`)
                            e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"
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
        {showColorVariants && (isLoadingVariants || selectedColorVariants.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
              <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                COLOR VARIANTS {isLoadingVariants ? "(loading...)" : `(${selectedColorVariants.length})`}
              </div>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex items-stretch gap-2 min-w-max px-1">
                {isLoadingVariants ? (
                  <div className="flex items-center justify-center p-3 min-w-[60px]">
                    <div 
                      className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
                    ></div>
                  </div>
                ) : selectedColorVariants.map((variant) => {
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
                        className="w-8 h-8 border-2 rounded-full relative"
                        style={{
                          backgroundColor: variant.color || "#666",
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                        }}
                      >
                        {variant.path && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={variant.path}
                            alt={variant.name}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                            onError={(e) => {
                              console.error(`Failed to load variant image: ${variant.path}`)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                      <span
                        className="text-[6px] font-bold text-center"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        {getColorFromAssetId(variant.id, activePart)?.toUpperCase() || "DEFAULT"}
                      </span>
                      {isSelected && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                        />
                      )}
                    </button>
                  )
                })
                }
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
                  ) : (style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                      alt={style.name}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "pixelated",
                        transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                      }}
                      onError={(e) => {
                        const p = (style.variants.find(v => v.id === style.defaultVariant) || style.variants[0])?.path
                        console.error(`Failed to load image: ${p}`)
                        e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"
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
      {showColorVariants && (isLoadingVariants || selectedColorVariants.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              COLOR VARIANTS {isLoadingVariants ? "(loading...)" : `(${selectedColorVariants.length})`}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {isLoadingVariants ? (
              <div className="flex items-center justify-center p-3 min-w-[60px]">
                <div 
                  className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
                ></div>
              </div>
            ) : selectedColorVariants.map((variant) => {
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
                    className="w-10 h-10 border-2 rounded-full relative"
                    style={{
                      backgroundColor: variant.color || "#666",
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                    }}
                  >
                    {variant.path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={variant.path}
                        alt={variant.name}
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          console.error(`Failed to load variant image: ${variant.path}`)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    {getColorFromAssetId(variant.id, activePart)?.replace(/([A-Z])/g, ' $1').trim().toUpperCase() || "DEFAULT"}
                  </span>
                  {isSelected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                    />
                  )}
                </button>
              )
            })
            }
          </div>
        </div>
      )}
    </div>
  )
}