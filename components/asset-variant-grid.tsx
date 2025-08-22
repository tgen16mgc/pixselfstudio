"use client"

import { useState } from "react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey } from "@/types/character"

interface AssetVariantGridProps {
  activePart: PartKey
  currentAssetId: string
  onAssetSelect: (assetId: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

export function AssetVariantGrid({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
}: AssetVariantGridProps) {
  const [, setPreviewAsset] = useState<string | null>(null)

  const part = CHARACTER_PARTS().find((p) => p.key === activePart)
  if (!part) return null

  const assets = part.assets || []

  if (isMobile) {
    // Mobile: Horizontal scrollable
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-max px-1">
            {assets.map((asset) => {
              const isSelected = currentAssetId === asset.id
              // const isPreview = previewAsset === asset.id

              return (
                <button
                  key={asset.id}
                  onClick={() => onAssetSelect(asset.id)}
                  onMouseEnter={() => setPreviewAsset(asset.id)}
                  onMouseLeave={() => setPreviewAsset(null)}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-3 border-2 text-[8px] font-bold backdrop-blur-sm transition-all duration-200 min-w-[80px] disabled:opacity-50"
                  style={{
                    backgroundColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.gold
                      : false // isPreview
                        ? PIXSELF_BRAND.colors.sky.light
                        : PIXSELF_BRAND.colors.cloud.light,
                    borderColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.navy
                      : PIXSELF_BRAND.colors.primary.navyLight,
                    color: PIXSELF_BRAND.colors.primary.navy,
                    boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                  }}
                >
                  {/* Asset preview */}
                  <div
                    className="w-12 h-12 border-2 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                      borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                    }}
                  >
                    {asset.id === "none" ? (
                      <span className="text-[10px]">✕</span>
                    ) : asset.path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                        alt={asset.name}
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

                  {/* Asset name */}
                  <span className="text-center leading-tight">{asset.name}</span>

                  {/* Selection indicator */}
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

        {/* Swipe hint */}
        <div className="text-center">
          <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
            ← SWIPE →
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Grid layout
  return (
    <div className="grid grid-cols-2 gap-3">
      {assets.map((asset) => {
        const isSelected = currentAssetId === asset.id
        // const isPreview = previewAsset === asset.id

        return (
          <button
            key={asset.id}
            onClick={() => onAssetSelect(asset.id)}
            onMouseEnter={() => setPreviewAsset(asset.id)}
            onMouseLeave={() => setPreviewAsset(null)}
            disabled={isLoading}
            aria-label={`Select ${asset.name}`}
            className={`
              relative aspect-square border-4 transition-all duration-200 overflow-hidden
              flex flex-col items-center justify-center p-2
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50
              ${isSelected ? "scale-105" : "hover:scale-102"}
            `}
            style={{
              backgroundColor: isSelected ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.cloud.light,
              color: PIXSELF_BRAND.colors.primary.navy,
              borderColor: isSelected ? PIXSELF_BRAND.colors.primary.navy : PIXSELF_BRAND.colors.primary.navyLight,
              imageRendering: "pixelated",
                              outline: `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}`,
            }}
          >
            {/* Asset Preview */}
            {asset.id === "none" ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className="text-[12px] font-bold text-center"
                  style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                >
                  NONE
                </div>
              </div>
            ) : (
              asset.path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.path || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                  alt={asset.name}
                  className="w-full h-full object-contain"
                  style={{
                    imageRendering: "pixelated",
                    transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                  }}
                />
              )
            )}

            {/* Selection Indicator */}
            {isSelected && (
              <div
                className="absolute top-1 right-1 w-3 h-3 border flex items-center justify-center"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                }}
              >
                <div className="w-1.5 h-1.5" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }} />
              </div>
            )}

            {/* Asset Name */}
            <div
              className="absolute bottom-1 left-1 right-1 text-[6px] font-bold text-center px-1 py-0.5 border"
              style={{
                backgroundColor: isSelected ? PIXSELF_BRAND.colors.cloud.white : PIXSELF_BRAND.colors.sky.light,
                borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                color: isSelected ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.primary.navyLight,
              }}
            >
              {asset.name.toUpperCase()}
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
