"use client"

import { useState, useEffect } from "react"
import { Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { preloadAssetVariants } from "@/utils/character-drawing"
import type { PartKey, AssetVariant } from "@/types/character"
import { useDynamicAssetVariants, DynamicAssetOptions } from "@/utils/dynamic-asset-manager"

interface DynamicColorVariantsProps {
  activePart: PartKey
  currentAssetId: string
  onColorVariantSelect: (variantId: string) => void
  isMobile?: boolean
}

export function DynamicColorVariants({
  activePart,
  currentAssetId,
  onColorVariantSelect,
  isMobile = false,
}: DynamicColorVariantsProps) {
  const [colorVariants, setColorVariants] = useState<AssetVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string>(currentAssetId)
  const [previewVariant, setPreviewVariant] = useState<string | null>(null)
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [variantError, setVariantError] = useState<string | null>(null)
  const { getColorVariantsForAsset, loading: manifestLoading, error: manifestError } = useDynamicAssetVariants()
  
  // Don't check for part types here - we'll do that in the render

  // Load available color variants for the current asset
  useEffect(() => {
    let isMounted = true;
    
    const loadColorVariants = () => {
      if (!isMounted) return;
      setIsLoadingVariants(true);
      
      const options: DynamicAssetOptions = {
        part: activePart,
        assetId: currentAssetId
      };
      
      // Use requestAnimationFrame instead of setTimeout to ensure we don't cause multiple rerenders
      requestAnimationFrame(() => {
        if (!isMounted) return;
        
        try {
          const variants = getColorVariantsForAsset(options);
          if (isMounted) {
            setColorVariants(variants);
            setIsLoadingVariants(false);
            setVariantError(null);
            // Preload all variant images to prevent flashing
            if (variants.length > 0) {
              preloadAssetVariants(activePart, currentAssetId).catch(console.error);
            }
          }
        } catch (error) {
          console.error("Error loading color variants:", error);
          if (isMounted) {
            setIsLoadingVariants(false);
            setVariantError("Failed to load color variants");
            setColorVariants([]);
          }
        }
      });
    };
    
    if (currentAssetId && currentAssetId !== "none") {
      loadColorVariants();
    } else {
      setColorVariants([]);
    }
    
    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, [currentAssetId, activePart]); // Remove getColorVariantsForAsset from dependencies

  // Keep selected variant in sync with currentAssetId
  useEffect(() => {
    setSelectedVariant(currentAssetId)
  }, [currentAssetId])

  const handleVariantSelect = (variant: AssetVariant) => {
    setSelectedVariant(variant.id)
    onColorVariantSelect(variant.id)
  }

  // Don't show color variants for accessories or if there are no variants
  // Add debug logging
  console.log(`🔍 DynamicColorVariants render check:`, {
    activePart, 
    currentAssetId,
    variantsCount: colorVariants.length,
    isLoadingVariants,
    manifestLoading
  });
  
  // Show error if manifest failed to load
  if (manifestError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            ERROR LOADING COLORS
          </div>
        </div>
        <div className="text-[8px] text-red-600 p-2 bg-red-50 rounded">
          {manifestError}
        </div>
      </div>
    )
  }

  if (
    ["earring", "glasses", "eyebrows"].includes(activePart) || 
    (colorVariants.length === 0 && !isLoadingVariants && !manifestLoading && !variantError) || 
    currentAssetId === "none"
  ) {
    console.log(`🚫 Not showing color variants for ${activePart}:${currentAssetId}`);
    return null
  }

  if (isMobile) {
    // Mobile: Horizontal scrollable
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
            COLOR VARIANTS {isLoadingVariants || manifestLoading ? "(loading...)" : `(${colorVariants.length})`}
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-max px-1">
            {isLoadingVariants || manifestLoading ? (
              <div className="flex items-center justify-center p-3 min-w-[60px]">
                <div 
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
                ></div>
              </div>
            ) : (
              colorVariants.map((variant) => {
                const isSelected = selectedVariant === variant.id
                const isPreview = previewVariant === variant.id

                return (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    onMouseEnter={() => setPreviewVariant(variant.id)}
                    onMouseLeave={() => setPreviewVariant(null)}
                    className="flex flex-col items-center gap-2 p-2 border-2 backdrop-blur-sm transition-all duration-200 min-w-[60px]"
                    style={{
                      backgroundColor: isSelected
                        ? PIXSELF_BRAND.colors.primary.gold
                        : isPreview
                          ? PIXSELF_BRAND.colors.sky.light
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
                            e.currentTarget.src = "/assets/placeholder.png"
                            e.currentTarget.alt = "Image not found"
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[6px] font-bold text-center"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      {/* Extract color name from ID (e.g., "tomboy-brown" -> "BROWN") */}
                      {variant.id === currentAssetId.split('-')[0] 
                        ? "DEFAULT" 
                        : variant.id.includes('-') 
                          ? variant.id.split('-').pop()?.toUpperCase() 
                          : "DEFAULT"}
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
            )}
          </div>
        </div>

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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
        <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
          COLOR VARIANTS {isLoadingVariants || manifestLoading ? "(loading...)" : `(${colorVariants.length})`}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {isLoadingVariants || manifestLoading ? (
          <div className="flex items-center justify-center p-3 min-w-[60px]">
            <div 
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
            ></div>
          </div>
        ) : (
          colorVariants.map((variant) => {
            const isSelected = selectedVariant === variant.id
            const isPreview = previewVariant === variant.id

            return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                onMouseEnter={() => setPreviewVariant(variant.id)}
                onMouseLeave={() => setPreviewVariant(null)}
                className="flex flex-col items-center gap-2 p-3 border-2 backdrop-blur-sm transition-all duration-200"
                style={{
                  backgroundColor: isSelected
                    ? PIXSELF_BRAND.colors.primary.gold
                    : isPreview
                      ? PIXSELF_BRAND.colors.sky.light
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
                        e.currentTarget.src = "/assets/placeholder.png"
                        e.currentTarget.alt = "Image not found"
                      }}
                    />
                  )}
                </div>
                <span className="text-[8px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  {/* Extract color name from ID (e.g., "tomboy-brown" -> "BROWN") */}
                  {variant.id === currentAssetId.split('-')[0] 
                    ? "DEFAULT" 
                    : variant.id.includes('-') 
                      ? variant.id.split('-').pop()?.toUpperCase() 
                      : "DEFAULT"}
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
        )}
      </div>
    </div>
  )
}
