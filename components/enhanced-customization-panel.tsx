"use client"

import { useState } from "react"
import { Palette, Settings, Eye, Shuffle, Undo2, Redo2 } from "lucide-react"
import { RETRO_CHARACTER_PALETTES, RETRO_UI_THEME } from "@/config/8bit-theme"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey } from "@/types/character"
import {
  EnhancedRetroPixelPanel,
  EnhancedRetroColorSwatch,
  EnhancedVariantButton,
  EnhancedRetroPixelButton,
} from "./enhanced-8bit-ui"

interface EnhancedCustomizationPanelProps {
  activePart: PartKey
  currentAssetId: string
  onAssetSelect: (assetId: string) => void
  onRandomizePart: (part: string) => void
  isLoading?: boolean
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

export function EnhancedCustomizationPanel({
  activePart,
  currentAssetId,
  onAssetSelect,
  onRandomizePart,
  isLoading = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: EnhancedCustomizationPanelProps) {
  const [previewColor, setPreviewColor] = useState<string | null>(null)

  const part = CHARACTER_PARTS().find((p) => p.key === activePart)
  if (!part) return null

  const assets = part.assets || []
  
  // Separate base styles from color variants
  const baseStyles = assets.filter(asset => {
    // Check if this asset is a color variant by looking for color suffixes
    const colorSuffixes = ['black', 'brown', 'blonde', 'red', 'blue', 'green', 'purple', 'pink', 'white', 'fair', 'light', 'medium', 'dark', 'olive', 'deep']
    return !colorSuffixes.some(color => asset.id.endsWith(`-${color}`))
  })

  // Get color variants for the currently selected base style
  const currentBaseStyle = baseStyles.find(style => 
    currentAssetId === style.id || currentAssetId.startsWith(style.id + '-')
  )
  


  const colors = RETRO_CHARACTER_PALETTES[activePart as keyof typeof RETRO_CHARACTER_PALETTES] || []

  // Color names for better accessibility
  const colorNames = {
    hair: ["Midnight", "Chestnut", "Auburn", "Sandy", "Platinum", "Mystic"],
    head: ["Fair", "Light", "Medium", "Olive", "Deep", "Dark"],
    eyes: ["Brown", "Blue", "Green", "Gray", "Purple", "Red"],
    eyebrows: ["Black", "Brown", "Blonde", "Gray", "Dark Red", "Purple"],
    mouth: ["Dark Red", "Red", "Muted Red", "Orange", "Pink", "Purple"],
    blush: ["Pink", "Red", "Muted Red", "Orange", "Dark Red", "Purple"],
    body: ["Fair", "Light", "Medium", "Olive", "Deep", "Dark"],
    costume: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
    shoes: ["Black", "Brown", "Gray", "Dark Blue", "Dark Red", "Dark Green"],
  }

  return (
    <div className="space-y-6">
      {/* Header with part info and quick actions */}
      <EnhancedRetroPixelPanel
        title={`CUSTOMIZE ${activePart.toUpperCase()}`}
        variant="accent"
        icon={<Settings className="h-4 w-4" />}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[8px]" style={{ color: RETRO_UI_THEME.text.muted }}>
            CURRENT: VAR {currentSelection.variant + 1} • COLOR {currentSelection.color + 1}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: RETRO_UI_THEME.background.secondary,
                borderColor: RETRO_UI_THEME.border.secondary,
                color: RETRO_UI_THEME.text.primary,
              }}
              title="Undo last change"
            >
              <Undo2 className="h-3 w-3" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: RETRO_UI_THEME.background.secondary,
                borderColor: RETRO_UI_THEME.border.secondary,
                color: RETRO_UI_THEME.text.primary,
              }}
              title="Redo last change"
            >
              <Redo2 className="h-3 w-3" />
            </button>
            <EnhancedRetroPixelButton
              onClick={() => onRandomizePart(activePart)}
              size="sm"
              disabled={isLoading}
              icon={<Shuffle className="h-3 w-3" />}
            >
              RANDOM
            </EnhancedRetroPixelButton>
          </div>
        </div>
      </EnhancedRetroPixelPanel>

      {/* Color Palette */}
      <EnhancedRetroPixelPanel title="COLOR PALETTE" icon={<Palette className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {colors.map((color: string, i: number) => (
              <EnhancedRetroColorSwatch
                key={i}
                color={color}
                colorName={colorNames[activePart as keyof typeof colorNames]?.[i]}
                selected={currentSelection.color === i}
                onClick={() => onColorSelect(activePart, i)}
                onPreview={(color) => setPreviewColor(color)}
                onPreviewEnd={() => setPreviewColor(null)}
                size="md"
                disabled={isLoading}
                showPreview={true}
              />
            ))}
          </div>

          {/* Selected color info */}
          <div
            className="p-3 border-2 flex items-center gap-3"
            style={{
              backgroundColor: RETRO_UI_THEME.background.secondary,
              borderColor: RETRO_UI_THEME.border.muted,
            }}
          >
            <div
              className="w-8 h-8 border-2"
              style={{
                backgroundColor: previewColor || colors[currentSelection.color],
                borderColor: RETRO_UI_THEME.border.primary,
              }}
            />
            <div className="flex-1">
              <div className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
                {colorNames[activePart as keyof typeof colorNames]?.[currentSelection.color] || `Color ${currentSelection.color + 1}`}
              </div>
              <div className="text-[8px]" style={{ color: RETRO_UI_THEME.text.muted }}>
                {previewColor || colors[currentSelection.color]}
              </div>
            </div>
            {previewColor && (
              <div className="text-[8px] font-bold" style={{ color: RETRO_UI_THEME.accent.primary }}>
                PREVIEW
              </div>
            )}
          </div>
        </div>
      </EnhancedRetroPixelPanel>

      {/* Style Variants */}
      <EnhancedRetroPixelPanel title="STYLE VARIANTS" icon={<Eye className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <EnhancedVariantButton
                key={i}
                variant={i}
                selected={currentSelection.variant === i}
                onClick={() => onVariantSelect(activePart, i)}
                onPreview={(variant) => setPreviewVariant(variant)}
                onPreviewEnd={() => setPreviewVariant(null)}
                disabled={isLoading}
                size="md"
              />
            ))}
          </div>

          {/* Variant info */}
          <div
            className="p-3 border-2 text-center"
            style={{
              backgroundColor: RETRO_UI_THEME.background.secondary,
              borderColor: RETRO_UI_THEME.border.muted,
            }}
          >
            <div className="text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
              VARIANT {(previewVariant ?? currentSelection.variant) + 1} OF 10
            </div>
            <div className="text-[8px]" style={{ color: RETRO_UI_THEME.text.muted }}>
              {previewVariant !== null ? "PREVIEW MODE" : "SELECTED"}
            </div>
          </div>
        </div>
      </EnhancedRetroPixelPanel>
    </div>
  )
}
