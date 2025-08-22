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

// Update the static config to use CDN URLs
function updateConfigWithCDN() {
  const cdnManifest = generateCDNManifest();
  const configPath = path.join(__dirname, '../config/character-assets.ts');
  
  console.log('\n⚙️  Updating static config with CDN URLs...');
  
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
${Object.entries(cdnManifest).map(([partKey, assets]) => {
  // Add "none" option for optional parts
  let assetsString = '';
  if (['hairBehind', 'hairFront', 'eyes', 'eyebrows', 'mouth', 'blush', 'earring', 'glasses'].includes(partKey)) {
    assetsString += `    {
      id: "none",
      name: "No ${partKey.toUpperCase()}",
      path: "",
      enabled: true,
    },\n`;
  }
  
  assetsString += assets.map(asset => {
    const assetId = asset.filename.replace(/\.png$/, '').replace(`${partKey}-`, '');
    const assetName = assetId === 'default' ? `Default ${partKey.toUpperCase()}` : 
      assetId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ` ${partKey.toUpperCase()}`;
    
    return `    {
      id: "${assetId}",
      name: "${assetName}",
      path: "${asset.cdnUrl}",
      enabled: true,
    }`;
  }).join(',\n');
  
  // Map manifest keys to config keys
  const keyMapping = {
    'body': 'body',
    'clothes': 'clothes',
    'hair-behind': 'hairBehind',
    'hair-front': 'hairFront',
    'eyes': 'eyes',
    'eyebrows': 'eyebrows',
    'mouth': 'mouth',
    'blush': 'blush',
    'earring': 'earring',
    'glasses': 'glasses'
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
  
  const configKey = keyMapping[partKey];
  const config = partConfig[configKey];
  
  return `  {
    key: "${configKey}",
    label: "${config.label}",
    icon: "${config.icon}",
    category: "${config.category}",
    assets: [
${assetsString}
    ],
    defaultAsset: "${config.defaultAsset}",
    optional: ${config.optional},
  }`;
}).join(',\n')}
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
