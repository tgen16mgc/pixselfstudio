"use client";

import React from "react";
import { PartDefinition } from "@/types/character";
import { CHARACTER_PARTS } from "@/config/character-assets";
import { EnhancedAssetSelector } from "./enhanced-asset-selector";

interface CharacterAssetSelectorProps {
  activePart: string;
  currentAssetId: string;
  onAssetSelect: (assetId: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

export function CharacterAssetSelector({
  activePart,
  currentAssetId,
  onAssetSelect,
  isLoading = false,
  isMobile = false,
}: CharacterAssetSelectorProps) {
  // Get current part definition
  const part = CHARACTER_PARTS().find((p: PartDefinition) => p.key === activePart);
  
  if (!part) {
    return (
      <div className="p-4 text-center text-sm">
        No assets available for this part.
      </div>
    );
  }
  
  return (
    <EnhancedAssetSelector
      activePart={part.key}
      currentAssetId={currentAssetId}
      onAssetSelect={onAssetSelect}
      isLoading={isLoading}
      isMobile={isMobile}
      part={part}
    />
  );
}
