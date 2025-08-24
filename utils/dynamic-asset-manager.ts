import { useState, useEffect, useCallback } from 'react';
import type { AssetDefinition, AssetVariant, PartKey } from '@/types/character';

// Type for the color variants manifest loaded from the server
interface ColorVariantsManifest {
  generatedAt: string;
  assets: {
    baseId: string;
    prefix: string;
    baseStyle: string;
    basePath: string | null;
    variants: {
      id: string;
      name: string;
      path: string;
      color: string;
    }[];
  }[];
}

// Interface for the dynamic asset manager
export interface DynamicAssetOptions {
  part: PartKey;
  assetId: string;
}

// Main dynamic asset manager hook
export function useDynamicAssetVariants() {
  const [manifest, setManifest] = useState<ColorVariantsManifest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load the color variants manifest
  useEffect(() => {
    let isMounted = true;
    
    async function loadManifest() {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        // Use full URL to avoid relative path issues
        const manifestUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/assets/color-variants-manifest.json`
          : '/assets/color-variants-manifest.json';

        console.log('🎨 Loading color variants manifest:', manifestUrl);
        const response = await fetch(manifestUrl);
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`Failed to load color variants manifest: ${response.status}`);
        }
        
        const data: ColorVariantsManifest = await response.json();
        
        if (!isMounted) return;
        
        console.log('🎨 Color variants manifest loaded:', data.generatedAt);
        setManifest(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Error loading color variants manifest:', err);
        setError('Failed to load color variants');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadManifest();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Get color variants for a specific asset - wrapped in useCallback
  const getColorVariantsForAsset = useCallback(({ part, assetId }: DynamicAssetOptions): AssetVariant[] => {
    if (!manifest || loading) {
      console.log('⏳ Manifest not yet loaded, returning empty variants');
      return [];
    }

    console.log(`🔎 Looking for variants of ${part}:${assetId} in manifest with ${manifest.assets.length} assets`);

    // Map PartKey to prefix used in manifest (supports both old and new paths)
    let prefix: string;
    let oldPrefix: string;
    let newPrefix: string;
    
    switch (part) {
      case 'hairFront': 
        oldPrefix = 'hair-front';
        newPrefix = 'front'; 
        prefix = oldPrefix;
        break;
      case 'hairBehind': 
        oldPrefix = 'hair-behind';
        newPrefix = 'behind';
        prefix = oldPrefix;
        break;
      default: 
        oldPrefix = part;
        newPrefix = part;
        prefix = part;
    }
    
    console.log(`🔎 Using prefix "${prefix}" for part "${part}"`);
    
    // Extract base style from assetId (removing color suffix if present)
    let baseStyle = assetId;
    
    // Generic approach: Parse the assetId to identify if it contains a style and color
    // For example: "front-tomboy", "smile-pink" -> Extract the base style
    if (assetId.includes('-')) {
      const parts = assetId.split('-');
      
      // Only process if we have at least two parts (e.g., "front-tomboy" or "smile-pink")
      if (parts.length >= 2) {
        // If we're dealing with hair parts, they have prefixes like "front-" or "behind-"
        if ((part === 'hairFront' || part === 'hairBehind') && (parts[0] === 'front' || parts[0] === 'behind')) {
          // For hair parts, use everything after the first dash as the base style
          baseStyle = parts.slice(1).join('-');
          console.log(`🔧 For hair, extracted base style "${baseStyle}" from "${assetId}"`);
        } else {
          // For other parts like "smile-pink", the first part is the base style
          baseStyle = parts[0];
          console.log(`🔧 Extracted base style "${baseStyle}" from "${assetId}"`);
        }
      }
    }
    
    // Handle special cases
    if (assetId === 'none' || assetId === '') {
      console.log('⚠️ Asset ID is empty or "none", returning empty variants');
      return [];
    }
    
    // We've already extracted the base style above, so we don't need additional extraction here

    // Build the baseId used in the manifest (try both old and new formats)
    const oldBaseId = `${oldPrefix}-${baseStyle}`;
    const newBaseId = `${newPrefix}-${baseStyle}`;
    
    console.log(`🔍 Looking for color variants with baseIds "${oldBaseId}" or "${newBaseId}"`);
    
    // Debug: List some baseIds in manifest for reference
    const sampleBaseIds = manifest.assets.slice(0, 5).map(a => a.baseId);
    console.log(`📋 Sample baseIds in manifest: ${sampleBaseIds.join(', ')}`);
    
    // Debug the currently selected asset
    console.log(`💡 Current selection - Part: ${part}, AssetId: ${assetId}, BaseStyle: ${baseStyle}, BaseId: ${oldBaseId}/${newBaseId}`);
    
    // Find the asset in the manifest (try both formats)
    const assetEntry = manifest.assets.find(a => a.baseId === oldBaseId || a.baseId === newBaseId);
    
    if (!assetEntry) {
      console.log(`❓ Asset ${oldBaseId} / ${newBaseId} not found in manifest`);
      return [];
    }

    // If we found it, return base asset + its color variants
    const baseAsset: AssetVariant = {
      id: baseStyle,
      name: `${baseStyle} (Default)`,
      path: assetEntry.basePath || '',
      color: '#666666',
      enabled: true
    };

    const variants = [baseAsset, ...assetEntry.variants.map(v => ({
      ...v,
      enabled: true
    }))];

    console.log(`✅ Found ${variants.length} variants for ${assetEntry.baseId}`);
    return variants;
  }, [manifest, loading]);

  // Get base asset details from the manifest - wrapped in useCallback
  const getBaseAsset = useCallback(({ part, assetId }: DynamicAssetOptions): AssetDefinition | null => {
    if (!manifest || loading) {
      return null;
    }

    // Map PartKey to prefix used in manifest (supports both old and new paths)
    let oldPrefix: string;
    let newPrefix: string;
    
    switch (part) {
      case 'hairFront': 
        oldPrefix = 'hair-front';
        newPrefix = 'front'; 
        break;
      case 'hairBehind': 
        oldPrefix = 'hair-behind';
        newPrefix = 'behind';
        break;
      default: 
        oldPrefix = part;
        newPrefix = part;
    }

    // Extract base style from assetId (removing color suffix if present)
    let baseStyle = assetId;
    
    // Check if this is already a color variant (e.g. "tomboy-brown")
    // Extract the color suffix by checking if assetId has a dash
    if (assetId.includes('-')) {
      const parts = assetId.split('-');
      // If we have something like "tomboy-brown", the baseStyle is "tomboy"
      if (parts.length === 2) {
        baseStyle = parts[0];
      }
    }

    // Build the baseId used in the manifest (try both old and new formats)
    const oldBaseId = `${oldPrefix}-${baseStyle}`;
    const newBaseId = `${newPrefix}-${baseStyle}`;
    
    // Find the asset in the manifest (try both formats)
    const assetEntry = manifest.assets.find(a => a.baseId === oldBaseId || a.baseId === newBaseId);
    
    if (!assetEntry) {
      return null;
    }

    return {
      id: baseStyle,
      name: baseStyle.charAt(0).toUpperCase() + baseStyle.slice(1),
      path: assetEntry.basePath || '',
      enabled: true
    };
  }, [manifest, loading]);

  return {
    getColorVariantsForAsset,
    getBaseAsset,
    loading,
    error,
    manifest
  };
}
