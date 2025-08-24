import type { PartKey } from '@/types/character';
import { CHARACTER_PARTS } from '@/config/character-assets';

// Local cache to store resolved paths
const pathCache: Record<string, string> = {};

// Mapping of part keys to their file structure paths
const PART_PATH_MAP: Record<string, { folderPath: string, filePrefix: string }> = {
  'hairFront': { folderPath: 'hair/hair-front', filePrefix: 'hair-front' },
  'hairBehind': { folderPath: 'hair/hair-behind', filePrefix: 'hair-behind' },
  'body': { folderPath: 'body/body', filePrefix: 'body' },
  'clothes': { folderPath: 'body/clothes', filePrefix: 'clothes' },
  'eyes': { folderPath: 'face/eyes', filePrefix: 'eyes' },
  'eyebrows': { folderPath: 'face/eyebrows', filePrefix: 'eyebrows' },
  'mouth': { folderPath: 'face/mouth', filePrefix: 'mouth' },
  'blush': { folderPath: 'face/blush', filePrefix: 'blush' },
  'glasses': { folderPath: 'accessories/glasses', filePrefix: 'glasses' },
  'earring': { folderPath: 'accessories/earring', filePrefix: 'earring' },
};

/**
 * Find the part definition for a given part key
 */
export function findPartDefinition(partKey: PartKey) {
  return CHARACTER_PARTS().find((p) => p.key === partKey);
}

/**
 * Find an asset definition within a part by its ID
 * This supports both regular assets and color variants
 */
export function findAssetDefinition(partKey: PartKey, assetId: string) {
  const partDefinition = findPartDefinition(partKey);
  if (!partDefinition) return null;
  
  // First try direct match (for base assets like "tomboy")
  const directMatch = partDefinition.assets.find(a => a.id === assetId);
  if (directMatch) return directMatch;
  
  // If no direct match, it might be a color variant like "tomboy-brown"
  // Extract the base style (e.g. "tomboy" from "tomboy-brown")
  if (assetId.includes('-')) {
    // Split by last hyphen to support multi-hyphen styles (e.g. "hair-long")
    // This handles cases like "hair-long-brown" where "hair-long" is the style and "brown" is the color
    const lastHyphenIndex = assetId.lastIndexOf('-');
    if (lastHyphenIndex > 0) {
      const baseStyle = assetId.substring(0, lastHyphenIndex);
      
      // Handle the special prefix cases
      let lookupId = baseStyle;
      if (partKey === 'hairFront' && !baseStyle.startsWith('front-')) {
        lookupId = `front-${baseStyle}`;
      } else if (partKey === 'hairBehind' && !baseStyle.startsWith('behind-')) {
        lookupId = `behind-${baseStyle}`;
      }
      
      return partDefinition.assets.find(a => a.id === lookupId);
    }
  }
  
  return null;
}

/**
 * Resolve an asset ID to its file path, handling color variants
 * This is the core function that determines the path for each asset
 */
export function resolveAssetPath(partKey: PartKey, assetId: string): string | null {
  // Use for detailed debugging
  const DEBUG = false;
  
  const cacheKey = `${partKey}:${assetId}`;
  
  // Check cache first for performance
  if (pathCache[cacheKey]) {
    return pathCache[cacheKey];
  }
  
  // For "none" assets, return empty string
  if (assetId === 'none' || assetId === '') {
    DEBUG && console.log(`🔍 Asset "${assetId}" is none or empty`);
    return '';
  }
  
  // Try to find asset in character parts definition first
  const assetDefinition = findAssetDefinition(partKey, assetId);
  if (assetDefinition?.path) {
    DEBUG && console.log(`✅ Found asset in definition: ${assetDefinition.path}`);
    pathCache[cacheKey] = assetDefinition.path;
    return assetDefinition.path;
  }
  
  // Get path components for this part
  const pathInfo = PART_PATH_MAP[partKey];
  if (!pathInfo) {
    console.warn(`⚠️ No path mapping for part: ${partKey}`);
    return null;
  }
  
  // Now try to construct the path based on our knowledge of the file structure
  let constructedPath: string;
  
  // Handle color variants: check if assetId includes a color suffix
  if (assetId.includes('-')) {
    // For special hair parts with prefixes in their asset IDs
    if (partKey === 'hairFront') {
      // Handle cases like "tomboy-brown" vs "front-tomboy-brown" 
      if (assetId.startsWith('front-')) {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId.substring(6)}.png`;
      } else {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
      }
    } else if (partKey === 'hairBehind') {
      // Similar handling for hair behind
      if (assetId.startsWith('behind-')) {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId.substring(7)}.png`;
      } else {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
      }
    } else {
      // Standard case for all other parts with color variants
      constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
    }
  } else {
    // For base assets without color variants
    // Handle special hair part prefixes
    if (partKey === 'hairFront') {
      if (assetId.startsWith('front-')) {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId.substring(6)}.png`;
      } else {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
      }
    } else if (partKey === 'hairBehind') {
      if (assetId.startsWith('behind-')) {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId.substring(7)}.png`;
      } else {
        constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
      }
    } else {
      // Standard case for all other parts
      constructedPath = `/assets/character/${pathInfo.folderPath}/${pathInfo.filePrefix}-${assetId}.png`;
    }
  }
  
  DEBUG && console.log(`🔧 Constructed path: ${constructedPath}`);
  
  // Cache and return the constructed path
  pathCache[cacheKey] = constructedPath;
  return constructedPath;
}

/**
 * Get the base style from an asset ID that might include a color variant
 * e.g. "tomboy-brown" -> "tomboy"
 */
export function getBaseStyleFromAssetId(assetId: string): string {
  if (!assetId || assetId === 'none') return '';
  
  // If it has a color variant (format: style-color)
  if (assetId.includes('-')) {
    const lastHyphenIndex = assetId.lastIndexOf('-');
    return assetId.substring(0, lastHyphenIndex);
  }
  
  return assetId;
}

/**
 * Get the color from an asset ID that includes a color variant
 * e.g. "tomboy-brown" -> "brown"
 */
export function getColorFromAssetId(assetId: string): string | null {
  if (!assetId || assetId === 'none' || !assetId.includes('-')) return null;
  
  const lastHyphenIndex = assetId.lastIndexOf('-');
  return assetId.substring(lastHyphenIndex + 1);
}

/**
 * Check if a given asset ID is a color variant 
 * e.g. "tomboy-brown" is a color variant, "tomboy" is not
 */
export function isColorVariant(assetId: string): boolean {
  if (!assetId || assetId === 'none') return false;
  
  return assetId.includes('-') && 
    ['red', 'blue', 'green', 'pink', 'brown', 'black', 'blonde', 'purple'].includes(
      assetId.substring(assetId.lastIndexOf('-') + 1)
    );
}
