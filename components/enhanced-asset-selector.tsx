"use client";

import { useState, useEffect } from "react";
import { Settings, Palette } from "lucide-react";
import { PIXSELF_BRAND } from "@/config/pixself-brand";
import type { PartKey, AssetDefinition, AssetVariant, PartDefinition } from "@/types/character";
import { getPartStylesWithVariants, getBaseAssetId } from "@/utils/dynamic-asset-manager";

interface EnhancedAssetSelectorProps {
  activePart: PartKey;
  currentAssetId: string;
  onAssetSelect: (assetId: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
  part: PartDefinition;
}

export function EnhancedAssetSelector({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
  part
}: EnhancedAssetSelectorProps) {
  // State for styles and their variants
  const [styleOptions, setStyleOptions] = useState<AssetDefinition[]>([]);
  const [colorVariants, setColorVariants] = useState<Record<string, AssetVariant[]>>({});
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Determine if color variants should be shown for this part
  const showColorVariants = !["earring", "glasses", "eyebrows", "blush"].includes(activePart);

  // Load assets with color variants
  useEffect(() => {
    const loadAssets = async () => {
      if (!part) return;
      
      setLoadingAssets(true);
      try {
        // Get styles and variants for this part
        const { styles, variants } = await getPartStylesWithVariants(part);
        
        setStyleOptions(styles);
        setColorVariants(variants);
        
        console.log(`✅ Loaded ${styles.length} styles with variants for ${part.key}`);
      } catch (error) {
        console.error(`Failed to load assets for ${part.key}:`, error);
      } finally {
        setLoadingAssets(false);
      }
    };
    
    loadAssets();
  }, [part, activePart]);

  // Update selected style based on current asset
  useEffect(() => {
    // Extract base style from current asset
    const baseStyle = getBaseAssetId(currentAssetId);
    setSelectedStyle(baseStyle);
  }, [currentAssetId]);

  // Get current variants for selected style
  const currentVariants = colorVariants[selectedStyle] || [];
  
  // Handler for selecting a style
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // Find available variants for this style
    const variants = colorVariants[styleId] || [];
    
    // If variants exist, select the first one, otherwise select the base style
    if (variants.length > 0) {
      onAssetSelect(variants[0].id);
    } else {
      onAssetSelect(styleId);
    }
  };
  
  // Handler for selecting a variant
  const handleVariantSelect = (variantId: string) => {
    onAssetSelect(variantId);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Style Options */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              STYLE OPTIONS
            </div>
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="flex items-stretch gap-2 min-w-max px-1">
              {styleOptions.map((style) => {
                const isSelected = selectedStyle === style.id;
                
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    disabled={isLoading || loadingAssets}
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
                          src={style.path}
                          alt={style.name}
                          className="w-full h-full object-contain"
                          style={{
                            imageRendering: "pixelated",
                            transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                          }}
                          onError={(e) => {
                            console.error(`Failed to load image: ${style.path}`);
                            e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg";
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Color Variants */}
        {showColorVariants && (loadingAssets || currentVariants.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
              <div className="text-[9px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                COLOR VARIANTS {loadingAssets ? "(loading...)" : `(${currentVariants.length})`}
              </div>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex items-stretch gap-2 min-w-max px-1">
                {loadingAssets ? (
                  <div className="flex items-center justify-center p-3 min-w-[60px]">
                    <div 
                      className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
                    ></div>
                  </div>
                ) : currentVariants.map((variant) => {
                  const isSelected = currentAssetId === variant.id;
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant.id)}
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
                              console.error(`Failed to load variant image: ${variant.path}`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <span
                        className="text-[6px] font-bold text-center"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        {variant.id === selectedStyle ? "DEFAULT" : variant.id.replace(`${selectedStyle}-`, "").toUpperCase()}
                      </span>
                      {isSelected && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
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
          {styleOptions.map((style) => {
            const isSelected = selectedStyle === style.id;
            
            return (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                disabled={isLoading || loadingAssets}
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
                      src={style.path}
                      alt={style.name}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "pixelated",
                        transform: activePart === "clothes" ? "translateY(-30%)" : "none",
                      }}
                      onError={(e) => {
                        console.error(`Failed to load image: ${style.path}`);
                        e.currentTarget.src = "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg";
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
            );
          })}
        </div>
      </div>

      {/* Color Variants - Desktop */}
      {showColorVariants && (loadingAssets || currentVariants.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div className="text-[10px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              COLOR VARIANTS {loadingAssets ? "(loading...)" : `(${currentVariants.length})`}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {loadingAssets ? (
              <div className="flex items-center justify-center p-3 min-w-[60px]">
                <div 
                  className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${PIXSELF_BRAND.colors.primary.gold} transparent transparent transparent` }}
                ></div>
              </div>
            ) : currentVariants.map((variant) => {
              const isSelected = currentAssetId === variant.id;
              
              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant.id)}
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
                          console.error(`Failed to load variant image: ${variant.path}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    {variant.id === selectedStyle ? "DEFAULT" : variant.id.replace(`${selectedStyle}-`, "").toUpperCase()}
                  </span>
                  {isSelected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
