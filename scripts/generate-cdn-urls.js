#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// GitHub CDN configuration
const GITHUB_CONFIG = {
  username: 'tgen16mgc',
  repo: 'pixselfstudio',
  branch: 'main',
  basePath: 'public/assets/character'
};

// Generate GitHub CDN URL
function generateCDNUrl(assetPath) {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.basePath}/${assetPath}`;
}

// Scan all assets and generate CDN URLs
function scanAssetsAndGenerateCDN() {
  const assetsDir = path.join(__dirname, '../public/assets/character');
  const cdnManifest = {};
  
  console.log('🔍 Scanning assets for CDN URL generation...');
  
  // Define the folder structure
  const partFolders = {
    body: ['body', 'clothes'],
    hair: ['hair-front', 'hair-behind'],
    face: ['eyes', 'eyebrows', 'mouth', 'blush'],
    accessories: ['earring', 'glasses'],
  };

  for (const category in partFolders) {
    for (const partKey of partFolders[category]) {
      const folderPath = path.join(assetsDir, category, partKey);
      
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        
        if (pngFiles.length > 0) {
          cdnManifest[partKey] = pngFiles.map(filename => {
            const assetPath = `${category}/${partKey}/${filename}`;
            const cdnUrl = generateCDNUrl(assetPath);
            return {
              filename,
              cdnUrl,
              localPath: `/assets/character/${assetPath}`
            };
          });
          
          console.log(`  ✅ ${partKey}: found ${pngFiles.length} assets`);
        }
      }
    }
  }
  
  return cdnManifest;
}

// Generate CDN manifest file
function generateCDNManifest() {
  const cdnManifest = scanAssetsAndGenerateCDN();
  
  const manifestPath = path.join(__dirname, '../public/assets/cdn-manifest.json');
  const manifestContent = {
    generated: new Date().toISOString(),
    github: GITHUB_CONFIG,
    assets: cdnManifest
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));
  
  console.log('\n✅ CDN manifest generated successfully!');
  console.log(`📄 Manifest saved to: ${manifestPath}`);
  
  // Print summary
  const totalAssets = Object.values(cdnManifest).reduce((sum, assets) => sum + assets.length, 0);
  console.log(`📊 Summary: ${totalAssets} total assets across ${Object.keys(cdnManifest).length} parts`);
  
  // Print example URLs
  console.log('\n🌐 Example CDN URLs:');
  Object.entries(cdnManifest).forEach(([partKey, assets]) => {
    if (assets.length > 0) {
      console.log(`  ${partKey}: ${assets[0].cdnUrl}`);
    }
  });
  
  return cdnManifest;
}

// Parse existing parts configuration to preserve color variants
function parseExistingParts(partsSection) {
  const parts = {};
  
  // Split the section into individual part objects
  const partObjects = partsSection.split(/\},\s*\{/).map((part, index) => {
    if (index === 0) return part;
    return '{' + part;
  });
  
  partObjects.forEach(partText => {
    // Extract part key
    const keyMatch = partText.match(/key:\s*"([^"]+)"/);
    if (!keyMatch) return;
    
    const partKey = keyMatch[1];
    
    // Extract assets array
    const assetsMatch = partText.match(/assets:\s*\[([\s\S]*?)\]/);
    if (!assetsMatch) return;
    
    const assetsText = assetsMatch[1];
    
    // Parse individual assets
    const assets = [];
    const assetObjects = assetsText.split(/\},\s*\{/).map((asset, index) => {
      if (index === 0) return asset;
      return '{' + asset;
    });
    
    assetObjects.forEach(assetText => {
      // Extract asset properties
      const idMatch = assetText.match(/id:\s*"([^"]+)"/);
      const nameMatch = assetText.match(/name:\s*"([^"]+)"/);
      const pathMatch = assetText.match(/path:\s*"([^"]*)"/);
      const enabledMatch = assetText.match(/enabled:\s*(true|false)/);
      const colorMatch = assetText.match(/color:\s*"([^"]+)"/);
      
      if (idMatch && nameMatch && pathMatch && enabledMatch) {
        const asset = {
          id: idMatch[1],
          name: nameMatch[1],
          path: pathMatch[1],
          enabled: enabledMatch[1] === 'true'
        };
        
        // Add color if present
        if (colorMatch) {
          asset.color = colorMatch[1];
        }
        
        assets.push(asset);
      }
    });
    
    if (assets.length > 0) {
      parts[partKey] = assets;
    }
  });
  
  return parts;
}

// Update CDN URLs in existing parts while preserving color variants
function updateCDNUrlsInExistingParts(existingParts, cdnManifest) {
  const updatedParts = {};
  
  // Key mapping for different naming conventions
  const keyMapping = {
    'hair-front': 'hairFront',
    'hair-behind': 'hairBehind'
  };
  
  for (const [partKey, existingAssets] of Object.entries(existingParts)) {
    const manifestKey = Object.keys(keyMapping).find(key => keyMapping[key] === partKey) || partKey;
    const manifestAssets = cdnManifest[manifestKey] || [];
    
    // Create a map of manifest assets by filename (without extension)
    const manifestAssetMap = {};
    manifestAssets.forEach(asset => {
      const baseFilename = asset.filename.replace(/\.png$/, '').replace(`${manifestKey}-`, '');
      manifestAssetMap[baseFilename] = asset.cdnUrl;
    });
    
    // Update existing assets with CDN URLs
    const updatedAssets = existingAssets.map(asset => {
      if (asset.id === 'none') {
        // Keep "none" assets as they are
        return asset;
      }
      
      // Check if this asset has a corresponding CDN URL
      const cdnUrl = manifestAssetMap[asset.id];
      if (cdnUrl) {
        return {
          ...asset,
          path: cdnUrl
        };
      }
      
      // If it's a color variant, try to construct the CDN URL
      const colorMatch = asset.id.match(/^(.+)-(.+)$/);
      if (colorMatch && asset.color) {
        const [, baseAssetId, colorName] = colorMatch;
        const baseCdnUrl = manifestAssetMap[baseAssetId];
        if (baseCdnUrl) {
          const colorVariantUrl = baseCdnUrl.replace(/\.png$/, `-${colorName}.png`);
          return {
            ...asset,
            path: colorVariantUrl
          };
        }
      }
      
      // Keep the asset as is if no CDN URL found
      return asset;
    });
    
    updatedParts[partKey] = updatedAssets;
  }
  
  return updatedParts;
}

// Generate parts configuration from updated parts
function generatePartsConfig(updatedParts) {
  const partConfig = {
    body: { label: "BODY", icon: "👤", category: "Body", defaultAsset: "default", optional: false },
    clothes: { label: "CLOTHES", icon: "👕", category: "Body", defaultAsset: "default", optional: true },
    hairBehind: { label: "HAIR BEHIND", icon: "🎭", category: "Hair", defaultAsset: "default", optional: true },
    hairFront: { label: "HAIR FRONT", icon: "💇", category: "Hair", defaultAsset: "default", optional: true },
    eyes: { label: "EYES", icon: "👀", category: "Face", defaultAsset: "default", optional: true },
    eyebrows: { label: "EYEBROWS", icon: "🤨", category: "Face", defaultAsset: "default", optional: true },
    mouth: { label: "MOUTH", icon: "👄", category: "Face", defaultAsset: "default", optional: true },
    blush: { label: "BLUSH", icon: "😊", category: "Face", defaultAsset: "none", optional: true },
    earring: { label: "EARRING", icon: "💎", category: "Accessories", defaultAsset: "none", optional: true },
    glasses: { label: "GLASSES", icon: "🤓", category: "Accessories", defaultAsset: "none", optional: true },
  };
  
  return Object.entries(updatedParts).map(([partKey, assets]) => {
    const config = partConfig[partKey];
    if (!config) return '';
    
    const assetsString = assets.map(asset => {
      let assetString = `    {
      id: "${asset.id}",
      name: "${asset.name}",
      path: "${asset.path}",
      enabled: ${asset.enabled}`;
      
      if (asset.color) {
        assetString += `,
      color: "${asset.color}"`;
      }
      
      assetString += ',\n    }';
      return assetString;
    }).join(',\n');
    
    return `  {
    key: "${partKey}",
    label: "${config.label}",
    icon: "${config.icon}",
    category: "${config.category}",
    assets: [
${assetsString}
    ],
    defaultAsset: "${config.defaultAsset}",
    optional: ${config.optional},
  }`;
  }).filter(part => part).join(',\n');
}

// Generate parts from CDN manifest when no existing parts are found
function generatePartsFromCDNManifest(cdnManifest) {
  const parts = {};
  
  // Key mapping for different naming conventions
  const keyMapping = {
    'hair-front': 'hairFront',
    'hair-behind': 'hairBehind'
  };
  
  const partConfig = {
    body: { label: "BODY", icon: "👤", category: "Body", defaultAsset: "default", optional: false },
    clothes: { label: "CLOTHES", icon: "👕", category: "Body", defaultAsset: "default", optional: true },
    hairBehind: { label: "HAIR BEHIND", icon: "🎭", category: "Hair", defaultAsset: "default", optional: true },
    hairFront: { label: "HAIR FRONT", icon: "💇", category: "Hair", defaultAsset: "default", optional: true },
    eyes: { label: "EYES", icon: "👀", category: "Face", defaultAsset: "default", optional: true },
    eyebrows: { label: "EYEBROWS", icon: "🤨", category: "Face", defaultAsset: "default", optional: true },
    mouth: { label: "MOUTH", icon: "👄", category: "Face", defaultAsset: "default", optional: true },
    blush: { label: "BLUSH", icon: "😊", category: "Face", defaultAsset: "none", optional: true },
    earring: { label: "EARRING", icon: "💎", category: "Accessories", defaultAsset: "none", optional: true },
    glasses: { label: "GLASSES", icon: "🤓", category: "Accessories", defaultAsset: "none", optional: true },
  };
  
  // Color variants for hair
  const hairColorVariants = {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513"
  };
  
  Object.entries(cdnManifest).forEach(([manifestKey, assets]) => {
    const configKey = keyMapping[manifestKey] || manifestKey;
    const config = partConfig[configKey];
    
    if (!config) return;
    
    const partAssets = [];
    
    // Add "none" option for optional parts
    if (config.optional && configKey !== 'body') {
      partAssets.push({
        id: "none",
        name: `No ${config.label}`,
        path: "",
        enabled: true,
      });
    }
    
    // Add assets from CDN manifest
    assets.forEach(asset => {
      const assetId = asset.filename.replace(/\.png$/, '').replace(`${manifestKey}-`, '');
      const assetName = assetId === 'default' ? `Default ${config.label}` : 
        assetId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ` ${config.label}`;
      
      // Add base asset
      partAssets.push({
        id: assetId,
        name: assetName,
        path: asset.cdnUrl,
        enabled: true,
      });
      
      // Add color variants for hair parts
      if ((configKey === 'hairFront' || configKey === 'hairBehind') && assetId !== 'none') {
        Object.entries(hairColorVariants).forEach(([colorName, colorHex]) => {
          const colorVariantId = `${assetId}-${colorName}`;
          const colorVariantName = `${assetName} (${colorName.charAt(0).toUpperCase() + colorName.slice(1)})`;
          const colorVariantPath = asset.cdnUrl.replace(/\.png$/, `-${colorName}.png`);
          
          partAssets.push({
            id: colorVariantId,
            name: colorVariantName,
            path: colorVariantPath,
            enabled: true,
            color: colorHex,
          });
        });
      }
    });
    
    parts[configKey] = partAssets;
  });
  
  return parts;
}

// Update the static config to use CDN URLs
function updateConfigWithCDN() {
  const cdnManifest = generateCDNManifest();
  const configPath = path.join(__dirname, '../config/character-assets.ts');
  
  console.log('\n⚙️  Updating static config with CDN URLs...');
  
  // Read existing config to preserve color variants
  const existingConfig = fs.readFileSync(configPath, 'utf8');
  
  // Find the FALLBACK_CHARACTER_PARTS array
  const startMarker = 'const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [';
  const endMarker = ']';
  
  const startIndex = existingConfig.indexOf(startMarker);
  if (startIndex === -1) {
    console.error('❌ Could not find FALLBACK_CHARACTER_PARTS in existing config');
    return;
  }
  
  const endIndex = existingConfig.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) {
    console.error('❌ Could not find end of FALLBACK_CHARACTER_PARTS array');
    return;
  }
  
  // Parse existing parts to preserve color variants
  const existingPartsSection = existingConfig.substring(startIndex + startMarker.length, endIndex);
  const existingParts = parseExistingParts(existingPartsSection);
  
  console.log(`Found ${Object.keys(existingParts).length} existing parts with color variants`);
  
  // Update CDN URLs for existing parts while preserving color variants
  let updatedParts;
  if (Object.keys(existingParts).length === 0) {
    // If no existing parts, generate new parts from CDN manifest
    console.log('No existing parts found, generating new parts from CDN manifest');
    updatedParts = generatePartsFromCDNManifest(cdnManifest);
  } else {
    // If existing parts found, update their CDN URLs while preserving color variants
    console.log('Updating existing parts with CDN URLs while preserving color variants');
    updatedParts = updateCDNUrlsInExistingParts(existingParts, cdnManifest);
  }
  
  // Generate the complete config content
  const configContent = `import type { AssetDefinition, PartDefinition } from "@/types/character"

// Re-export types for convenience
export type { AssetDefinition, PartDefinition }

export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

// Function to get character parts (now returns fallback for client-side hook)
export function CHARACTER_PARTS(): PartDefinition[] {
  // For now, return fallback parts
  // In the future, this could be enhanced to read from a server-side manifest
  return FALLBACK_CHARACTER_PARTS
}

// Fallback manual configuration in case auto-discovery fails
const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [
${generatePartsConfig(updatedParts)}
]

// Layering order (high to low z-index)
export const LAYER_ORDER: PartKey[] = [
  "glasses", // Highest layer - glasses go on top
  "earring", // Earring on top of most elements
  "hairFront",
  "eyebrows",
  "eyes",
  "mouth",
  "blush", // Blush on cheeks
  "clothes",
  "body",
  "hairBehind", // Lowest layer
]

// Helper functions for easy asset management
export function getPartByKey(key: PartKey): PartDefinition | undefined {
  return CHARACTER_PARTS().find((part) => part.key === key)
}

export function getAssetPath(partKey: PartKey, assetId: string): string {
  const part = getPartByKey(partKey)
  if (!part) return ""

  const asset = part.assets.find((a) => a.id === assetId)
  return asset?.path || ""
}

export function getEnabledAssets(partKey: PartKey): AssetDefinition[] {
  const part = getPartByKey(partKey)
  if (!part) return []

  return part.assets.filter((asset) => asset.enabled)
}

// Easy way to add new assets - just call this function
export function addAssetToPart(partKey: PartKey, assetId: string, name: string, path: string, enabled = true): void {
  const part = getPartByKey(partKey)
  if (part) {
    part.assets.push({
      id: assetId,
      name,
      path,
      enabled,
    })
  }
}

// Force refresh the asset cache (useful for development)
let _cachedParts: PartDefinition[] | null = null

export function refreshAssetCache(): void {
  _cachedParts = null
}
`;
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Static config updated with CDN URLs!');
}

// Main execution
if (require.main === module) {
  try {
    updateConfigWithCDN();
    console.log('\n🎉 CDN setup completed successfully!');
    console.log('🌐 All assets are now served through GitHub CDN');
  } catch (error) {
    console.error('❌ Error setting up CDN:', error);
    process.exit(1);
  }
}

module.exports = { generateCDNUrl, scanAssetsAndGenerateCDN };
