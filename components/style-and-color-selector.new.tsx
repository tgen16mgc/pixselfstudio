"use client"

import { useState, useEffect } from "react"
import { Settings, Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { STANDARD_COLORS } from "@/config/color-variants"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey, AssetDefinition, AssetVariant, PartDefinition } from "@/types/character"
// Import but don't use the problematic functions
import { getExistingColorVariants, extractColorVariantInfo } from "@/utils/asset-existence-checker"

interface StyleAndColorSelectorProps {
  activePart: PartKey
  currentAssetId: string
  onAssetSelect: (assetId: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

// Helper function to extract base style from asset ID
function getBaseStyleId(assetId: string, partKey?: PartKey): string {
  if (!assetId || assetId === "none") {
    return assetId
  }
  
  // Extract the base ID (always return the first part for simplicity)
  return assetId.split('-')[0]
}

export function StyleAndColorSelector({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
}: StyleAndColorSelectorProps) {
  const [baseStyles, setBaseStyles] = useState<AssetDefinition[]>([])
  const [selectedBaseStyle, setSelectedBaseStyle] = useState<string>("")
  
  // Load base styles when active part changes
  useEffect(() => {
    // Get all part definitions
    const parts = CHARACTER_PARTS()
    // Find the current active part
    const activePart1 = parts.find((p) => p.key === activePart)
    
    if (activePart1) {
      // Get all assets for this part
      const assets = activePart1.assets
      setBaseStyles(assets)
      
      // Select the current base style
      const baseStyleId = getBaseStyleId(currentAssetId, activePart)
      setSelectedBaseStyle(baseStyleId)
    } else {
      setBaseStyles([])
      setSelectedBaseStyle("")
    }
  }, [activePart, currentAssetId])

  const handleBaseStyleSelect = (styleId: string) => {
    onAssetSelect(styleId)
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Styles - Mobile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              STYLES ({baseStyles.length})
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
                    className="flex flex-col items-center gap-2 p-2 border-2 backdrop-blur-sm transition-all duration-200 w-16 disabled:opacity-50"
                    style={{
                      backgroundColor: isSelected
                        ? PIXSELF_BRAND.colors.primary.gold
                        : PIXSELF_BRAND.colors.cloud.light,
                      borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
                      boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 border-2 flex items-center justify-center"
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
                          onError={(e) => {
                            const p = style.path
                            console.error(`Failed to load image: ${p}`)
                            e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"
                          }}
                        />
                      ) : (
                        <span className="text-[10px]">?</span>
                      )}
                    </div>
                    
                    <span className="text-[6px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      {style.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="space-y-5">
      {/* Styles - Desktop */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            STYLES ({baseStyles.length})
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto pr-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F3F4F6'
        }}>
          <div className="grid grid-cols-3 gap-3 pb-2">
            {baseStyles.map((style) => {
            const isSelected = selectedBaseStyle === style.id
            
            return (
              <button
                key={style.id}
                onClick={() => handleBaseStyleSelect(style.id)}
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
                  className="w-14 h-14 border-2 flex items-center justify-center"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                    borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  }}
                >
                  {style.id === "none" ? (
                    <span className="text-base">✕</span>
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
                      onError={(e) => {
                        const p = style.path
                        console.error(`Failed to load image: ${p}`)
                        e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"
                      }}
                    />
                  ) : (
                    <span className="text-base">?</span>
                  )}
                </div>
                
                <span className="text-xs font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  {style.name}
                </span>
              </button>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
