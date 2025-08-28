"use client"

import { useState, useEffect } from "react"
import { Palette } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import type { PartKey } from "@/types/character"
import { checkAssetVariantExists } from "@/utils/asset-existence-checker"

interface ColorPalettePlaceholderProps {
  activePart: PartKey
  isMobile?: boolean
  currentAssetId?: string
  onSelectColor?: (color: string) => void
}

// Standard colors to try for each part
const STANDARD_COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white"];

export function ColorPalettePlaceholder({ 
  activePart, 
  isMobile = false,
  currentAssetId = "default",
  onSelectColor
}: ColorPalettePlaceholderProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Skip rendering for parts that don't typically have color variants
  if (["earring", "eyebrows", "blush"].includes(activePart)) {
    return null;
  }

  // Check which color variants exist for the current asset
  useEffect(() => {
    async function checkAvailableColors() {
      setLoading(true);
      const colors: string[] = [];
      
      // Only check variants if we have a valid asset ID
      if (currentAssetId && currentAssetId !== "default") {
        // Check each standard color to see if a variant exists
        for (const color of STANDARD_COLORS) {
          const exists = await checkAssetVariantExists(activePart, currentAssetId, color);
          if (exists) {
            colors.push(color);
          }
        }
      }
      
      setAvailableColors(colors);
      setLoading(false);
    }
    
    checkAvailableColors();
  }, [activePart, currentAssetId]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (onSelectColor) {
      onSelectColor(color);
    }
  };

  // If loading or no colors available, show the default message
  if (loading || availableColors.length === 0) {
    if (isMobile) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
            <div 
              className="text-[9px] font-bold tracking-wider" 
              style={{ color: PIXSELF_BRAND.colors.primary.navy }}
            >
              DEFAULT COLOR ONLY
            </div>
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-center p-3 w-full text-center">
              <span 
                className="text-xs" 
                style={{ color: PIXSELF_BRAND.colors.primary.navy }}
              >
                {loading ? "Checking available colors..." : "Only default style available"}
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div 
            className="text-[10px] font-bold tracking-wider" 
            style={{ color: PIXSELF_BRAND.colors.primary.navy }}
          >
            DEFAULT COLOR ONLY
          </div>
        </div>
        
        <div className="flex items-center justify-center p-3 col-span-3 text-center">
          <span 
            className="text-sm" 
            style={{ color: PIXSELF_BRAND.colors.primary.navy }}
          >
            {loading ? "Checking available colors..." : "Only default style available"}
          </span>
        </div>
      </div>
    );
  }
  
  // If colors are available, display them
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
          <div 
            className="text-[9px] font-bold tracking-wider" 
            style={{ color: PIXSELF_BRAND.colors.primary.navy }}
          >
            COLOR OPTIONS ({availableColors.length})
          </div>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-max px-1">
            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="flex flex-col items-center gap-2 p-2 border-2 backdrop-blur-sm transition-all duration-200 min-w-[60px]"
                  style={{
                    backgroundColor: isSelected
                      ? PIXSELF_BRAND.colors.primary.gold
                      : PIXSELF_BRAND.colors.cloud.light,
                    borderColor: isSelected 
                      ? PIXSELF_BRAND.colors.primary.navy 
                      : PIXSELF_BRAND.colors.primary.navyLight,
                    boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 border-2 rounded-full"
                    style={{
                      backgroundColor: color,
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                    }}
                  ></div>
                  <span 
                    className="text-[6px] font-bold text-center" 
                    style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                  >
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop version with color options
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
        <div 
          className="text-[10px] font-bold tracking-wider" 
          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
        >
          COLOR OPTIONS ({availableColors.length})
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {availableColors.map((color) => {
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className="flex flex-col items-center gap-2 p-3 border-2 backdrop-blur-sm transition-all duration-200"
              style={{
                backgroundColor: isSelected
                  ? PIXSELF_BRAND.colors.primary.gold
                  : PIXSELF_BRAND.colors.cloud.light,
                borderColor: isSelected 
                  ? PIXSELF_BRAND.colors.primary.navy 
                  : PIXSELF_BRAND.colors.primary.navyLight,
                boxShadow: isSelected ? PIXSELF_BRAND.shadows.pixel : "none",
              }}
            >
              <div
                className="w-10 h-10 border-2 rounded-full"
                style={{
                  backgroundColor: color,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                }}
              ></div>
              <span 
                className="text-[8px] font-bold text-center" 
                style={{ color: PIXSELF_BRAND.colors.primary.navy }}
              >
                {color.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}