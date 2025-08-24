#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Color variants configuration
const COLOR_VARIANTS = {
  hair: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  hairFront: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  hairBehind: {
    black: "#333333",
    white: "#FAFAFA",
    pink: "#F8BBD0",
    yellow: "#FFF9C4",
    red: "#FF8A80",
    wineRed: "#B56576",
    purple: "#CE93D8",
    blue: "#90CAF9",
    brown: "#8B4513",
  },
  body: {
    fair: "#FDBCB4",
    light: "#EEA990",
    medium: "#C68642",
    olive: "#8D5524",
    deep: "#654321",
    dark: "#3C2414",
  },
  clothes: {
    red: "#FF6B6B",
    blue: "#4ECDC4",
    green: "#45B7D1",
    yellow: "#96CEB4",
    purple: "#FFEAA7",
    orange: "#DDA0DD",
  },
  eyes: {
    brown: "#8B4513",
    blue: "#4169E1",
    green: "#228B22",
    gray: "#808080",
    purple: "#9370DB",
    red: "#DC143C",
  },
  mouth: {
    darkRed: "#DC143C",
    red: "#FF6347",
    mutedRed: "#CD5C5C",
    orange: "#FF8C00",
    pink: "#FF69B4",
    purple: "#9370DB",
  },
  eyebrows: {},
  blush: {},
  earring: {},
  glasses: {},
};

const ASSETS_BASE_PATH = path.join(process.cwd(), 'public/assets/character');
const MANIFEST_PATH = path.join(process.cwd(), 'public/assets/color-variants-manifest.json');

// Function to recursively scan directories and find all PNG files
async function scanDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await scanDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      const relativePath = path.relative(ASSETS_BASE_PATH, fullPath);
      files.push({
        path: relativePath,
        fullPath: fullPath,
        name: entry.name
      });
    }
  }
  
  return files;
}

// Function to parse the filename and extract the base and color variant information
function parseAssetFilename(filename) {
  // Example: hair-front-tomboy-brown.png -> { prefix: hair-front, baseStyle: tomboy, colorVariant: brown }
  const nameWithoutExt = filename.replace('.png', '');
  const parts = nameWithoutExt.split('-');
  
  // If there are at least 3 parts (like hair-front-tomboy), and possibly more parts for color variants
  if (parts.length >= 3) {
    // The last part could be a color variant, or it could be part of the base style name
    // For example: hair-front-tomboy-brown.png -> brown is the color variant
    // But hair-front-side2.png -> side2 is part of the base style
    
    // Get the category/prefix (e.g., "hair-front")
    const prefix = parts.slice(0, 2).join('-');
    
    // Check if the last part matches any known color variant
    const possibleColor = parts[parts.length - 1];
    let knownColorNames = [];
    
    // Determine which category this asset belongs to for color variant checking
    let category = prefix;
    if (prefix === 'hair-front') category = 'hairFront';
    if (prefix === 'hair-behind') category = 'hairBehind';
    
    // Get all possible color names for this category
    if (COLOR_VARIANTS[category]) {
      knownColorNames = Object.keys(COLOR_VARIANTS[category]);
    }
    
    // If the last part is a known color name, it's a color variant
    if (knownColorNames.includes(possibleColor)) {
      // The base style is everything except the prefix and color variant
      const baseStyle = parts.slice(2, parts.length - 1).join('-');
      return { 
        prefix, 
        baseStyle, 
        colorVariant: possibleColor,
        isColorVariant: true
      };
    } else {
      // If not a color variant, the base style is everything after the prefix
      const baseStyle = parts.slice(2).join('-');
      return { 
        prefix, 
        baseStyle, 
        colorVariant: null,
        isColorVariant: false
      };
    }
  }
  
  // If the format doesn't match our expected pattern
  return { 
    prefix: parts.length > 1 ? parts.slice(0, 2).join('-') : parts[0], 
    baseStyle: parts.length > 2 ? parts.slice(2).join('-') : '', 
    colorVariant: null,
    isColorVariant: false
  };
}

// Main function to scan all assets and generate the color variants manifest
async function generateColorVariantsManifest() {
  console.log('🔍 Scanning assets directory:', ASSETS_BASE_PATH);
  const allFiles = await scanDirectory(ASSETS_BASE_PATH);
  console.log(`✅ Found ${allFiles.length} total asset files`);
  
  // Group assets by their prefix and base style
  const assetsByBase = {};
  
  for (const file of allFiles) {
    const { prefix, baseStyle, colorVariant, isColorVariant } = parseAssetFilename(file.name);
    
    if (!prefix || !baseStyle) continue;
    
    const baseId = `${prefix}-${baseStyle}`;
    
    // Initialize entry if it doesn't exist
    if (!assetsByBase[baseId]) {
      assetsByBase[baseId] = {
        baseId,
        prefix,
        baseStyle,
        basePath: isColorVariant ? null : `/assets/character/${file.path}`, // Only use non-color variants as base path
        variants: []
      };
    } else if (!isColorVariant && !assetsByBase[baseId].basePath) {
      // If we find a non-variant base file later, update the basePath
      assetsByBase[baseId].basePath = `/assets/character/${file.path}`;
    }
    
    // Add variant if this is a color variant
    if (isColorVariant) {
      let category = prefix;
      if (prefix === 'hair-front') category = 'hairFront';
      if (prefix === 'hair-behind') category = 'hairBehind';
      
      // Get the color hex code from our configuration
      const colorHex = COLOR_VARIANTS[category]?.[colorVariant] || '#666666';
      
      assetsByBase[baseId].variants.push({
        id: `${baseStyle}-${colorVariant}`,
        name: `${baseStyle} (${colorVariant.charAt(0).toUpperCase() + colorVariant.slice(1)})`,
        path: `/assets/character/${file.path}`,
        color: colorHex
      });
    }
  }
  
  // Convert to array for the manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    assets: Object.values(assetsByBase).map(entry => ({
      ...entry,
      variants: entry.variants.length > 0 ? entry.variants : []
    }))
  };
  
  // Write to manifest file
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✅ Color variants manifest generated at: ${MANIFEST_PATH}`);
  console.log(`✅ Found ${manifest.assets.length} base assets with ${
    manifest.assets.reduce((sum, asset) => sum + asset.variants.length, 0)
  } color variants`);
  
  // Print some sample entries
  console.log('\nSample assets with color variants:');
  const sampleAssets = manifest.assets.filter(a => a.variants.length > 0).slice(0, 3);
  for (const asset of sampleAssets) {
    console.log(`${asset.baseId}: ${asset.variants.length} variants`);
    console.log(`  Base: ${asset.basePath}`);
    console.log(`  Variants: ${asset.variants.map(v => v.id).join(', ')}`);
  }
}

// Create test assets for demonstration
async function createTestColorVariants() {
  console.log('🔧 Creating test color variants for demonstration...');
  
  // Define test assets to create
  const testVariants = [
    { base: 'hair-front-tomboy.png', colors: ['brown', 'blonde', 'black'] },
    { base: 'hair-front-2side.png', colors: ['red', 'blue', 'purple'] },
    { base: 'mouth-smile1.png', colors: ['pink', 'red'] },
    { base: 'eyes-default.png', colors: ['blue', 'green'] },
  ];
  
  for (const testAsset of testVariants) {
    const baseFile = path.join(ASSETS_BASE_PATH, testAsset.base.split('-')[0], testAsset.base.split('-')[1], testAsset.base);
    
    // Check if base file exists
    try {
      await stat(baseFile);
      console.log(`✅ Base file exists: ${baseFile}`);
      
      // Create color variants
      for (const color of testAsset.colors) {
        const variantName = testAsset.base.replace('.png', `-${color}.png`);
        const variantPath = path.join(path.dirname(baseFile), variantName);
        
        // Copy the base file to create a variant
        fs.copyFileSync(baseFile, variantPath);
        console.log(`✅ Created color variant: ${variantPath}`);
      }
    } catch (error) {
      console.error(`❌ Error creating test variants for ${testAsset.base}:`, error.message);
    }
  }
}

// Run the main function
async function main() {
  const args = process.argv.slice(2);
  const createTestAssets = args.includes('--create-test-assets');
  
  if (createTestAssets) {
    await createTestColorVariants();
  }
  
  await generateColorVariantsManifest();
}

main().catch(console.error);
