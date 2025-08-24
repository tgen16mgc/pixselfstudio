#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);

/**
 * Creates test color variant assets by copying existing assets
 * This helps demonstrate the color variant system without having to create real assets
 */
async function createTestAssets() {
  console.log('🎨 Creating test color variant assets...');
  
  const baseDir = path.join(process.cwd(), 'public/assets/character');
  
  // Define our test cases (base assets and their color variants)
  const testCases = [
    {
      source: 'hair/hair-front/hair-front-tomboy.png',
      variants: [
        { color: 'brown', path: 'hair/hair-front/hair-front-tomboy-brown.png' },
        { color: 'blonde', path: 'hair/hair-front/hair-front-tomboy-blonde.png' },
        { color: 'black', path: 'hair/hair-front/hair-front-tomboy-black.png' }
      ]
    },
    {
      source: 'hair/hair-front/hair-front-2side.png',
      variants: [
        { color: 'red', path: 'hair/hair-front/hair-front-2side-red.png' },
        { color: 'blue', path: 'hair/hair-front/hair-front-2side-blue.png' },
        { color: 'purple', path: 'hair/hair-front/hair-front-2side-purple.png' }
      ]
    },
    {
      source: 'face/mouth/mouth-smile1.png',
      variants: [
        { color: 'pink', path: 'face/mouth/mouth-smile1-pink.png' },
        { color: 'red', path: 'face/mouth/mouth-smile1-red.png' }
      ]
    },
    {
      source: 'face/eyes/eyes-default.png',
      variants: [
        { color: 'blue', path: 'face/eyes/eyes-default-blue.png' },
        { color: 'green', path: 'face/eyes/eyes-default-green.png' }
      ]
    }
  ];
  
  // Process each test case
  for (const testCase of testCases) {
    const sourcePath = path.join(baseDir, testCase.source);
    
    // Check if source file exists
    if (!(await exists(sourcePath))) {
      console.error(`❌ Source file not found: ${sourcePath}`);
      continue;
    }
    
    console.log(`✅ Found source asset: ${testCase.source}`);
    
    // Create each variant
    for (const variant of testCase.variants) {
      const variantPath = path.join(baseDir, variant.path);
      const variantDir = path.dirname(variantPath);
      
      // Create directory if it doesn't exist
      if (!(await exists(variantDir))) {
        await mkdir(variantDir, { recursive: true });
      }
      
      // Copy the source file to create variant
      try {
        await copyFile(sourcePath, variantPath);
        console.log(`✅ Created ${variant.color} variant: ${variant.path}`);
      } catch (err) {
        console.error(`❌ Failed to create ${variant.color} variant: ${err.message}`);
      }
    }
  }
  
  console.log('🎉 Test assets creation complete!');
  
  // Create color variants manifest
  await generateColorVariantsManifest();
}

async function generateColorVariantsManifest() {
  console.log('📝 Generating color variants manifest...');
  
  const baseDir = path.join(process.cwd(), 'public/assets/character');
  const manifestPath = path.join(process.cwd(), 'public/assets/color-variants-manifest.json');
  
  // Helper function to recursively scan directory
  async function scanDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await scanDirectory(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.png')) {
        // Get relative path from baseDir
        const relativePath = path.relative(baseDir, fullPath);
        files.push({
          name: entry.name,
          path: relativePath,
          fullPath
        });
      }
    }
    
    return files;
  }

  // Group assets by base name and color variants
  function groupAssetsByBase(files) {
    const grouped = {};
    
    for (const file of files) {
      // Extract info from filename pattern: "part-subpart-style-color.png"
      // Examples: 
      // - hair-front-tomboy-brown.png
      // - mouth-smile-pink.png
      // - eyes-default-blue.png
      const nameParts = file.name.replace('.png', '').split('-');
      
      if (nameParts.length < 2) continue; // Invalid naming pattern
      
      // Extract the primary components based on pattern
      let partType, subType, style, colorVariant;
      
      // Standardize parsing regardless of part type
      if (nameParts.length === 2) {
        // Simple case: "part-style.png"
        // Example: "body-default.png"
        partType = nameParts[0]; // e.g., "body"
        style = nameParts[1];    // e.g., "default"
        subType = '';            // No subtype
        colorVariant = null;     // No color variant
      } else if (nameParts.length === 3) {
        // Medium case: Could be either "part-subtype-style.png" or "part-style-color.png"
        // Examples: "hair-front-tomboy.png" or "mouth-smile-pink.png"
        
        partType = nameParts[0]; // e.g., "hair" or "mouth"
        
        // Check if this is a part with subtype (like hair-front)
        if (partType === 'hair') {
          subType = nameParts[1];  // e.g., "front"
          style = nameParts[2];    // e.g., "tomboy"
          colorVariant = null;     // No color variant
        } else {
          // For parts without subtypes, the second part is the style, third might be color
          subType = '';
          style = nameParts[1];    // e.g., "smile"
          colorVariant = nameParts[2]; // e.g., "pink"
        }
      } else if (nameParts.length >= 4) {
        // Complex case: "part-subtype-style-color.png"
        // Example: "hair-front-tomboy-brown.png"
        partType = nameParts[0];   // e.g., "hair"
        subType = nameParts[1];    // e.g., "front"
        style = nameParts[2];      // e.g., "tomboy"
        colorVariant = nameParts[3]; // e.g., "brown"
      }
      
      console.log(`📝 Parsed file: ${file.name} -> part=${partType}, subtype=${subType}, style=${style}, color=${colorVariant || 'none'}`);
      
      // Construct the base ID based on the components we extracted
      let baseId;
      if (subType) {
        baseId = `${partType}-${subType}-${style}`;
      } else {
        baseId = `${partType}-${style}`;
      }
      
      // Initialize the base entry if it doesn't exist
      if (!grouped[baseId]) {
        grouped[baseId] = {
          baseId,
          part: partType,
          subpart: subType,
          style,
          basePath: colorVariant ? null : `/assets/character/${file.path}`,
          variants: []
        };
      } else if (!colorVariant && !grouped[baseId].basePath) {
        // Update base path if this is the non-color variant version
        grouped[baseId].basePath = `/assets/character/${file.path}`;
      }
      
      // If this file represents a color variant, add it to the variants array
      if (colorVariant) {
        const variantId = subType ? `${style}-${colorVariant}` : `${style}-${colorVariant}`;
        
        grouped[baseId].variants.push({
          id: variantId,
          name: `${style} (${colorVariant.charAt(0).toUpperCase() + colorVariant.slice(1)})`,
          path: `/assets/character/${file.path}`,
          color: getColorHex(colorVariant)
        });
      }
    }
    
    return grouped;
  }

  // Helper to get color hex codes
  function getColorHex(colorName) {
    // Common color hex codes
    const colorMap = {
      black: "#333333",
      white: "#FAFAFA",
      pink: "#F8BBD0",
      yellow: "#FFF9C4",
      red: "#FF8A80",
      blue: "#90CAF9",
      green: "#4ECDC4",
      purple: "#CE93D8",
      brown: "#8B4513",
      blonde: "#DAA520",
      wineRed: "#B56576",
      fair: "#FDBCB4",
      light: "#EEA990",
      medium: "#C68642",
      olive: "#8D5524",
      deep: "#654321",
      dark: "#3C2414",
    };
    
    return colorMap[colorName] || "#666666";
  }
  
  try {
    // Scan all assets
    const allFiles = await scanDirectory(baseDir);
    console.log(`✅ Found ${allFiles.length} asset files`);
    
    // Group by base asset
    const grouped = groupAssetsByBase(allFiles);
    
    // We don't need special cases anymore - our standardized parsing handles all variants
    
    // Create manifest
    const manifest = {
      generatedAt: new Date().toISOString(),
      assets: Object.values(grouped)
    };
    
    // Write manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Manifest created at: ${manifestPath}`);
    
    // Log stats
    const variantCount = manifest.assets.reduce((sum, asset) => sum + asset.variants.length, 0);
    console.log(`📊 Stats: ${manifest.assets.length} base assets with ${variantCount} color variants`);
    
    // Display sample
    const samplesWithVariants = manifest.assets.filter(a => a.variants.length > 0).slice(0, 3);
    if (samplesWithVariants.length > 0) {
      console.log('\n📋 Sample assets with color variants:');
      for (const asset of samplesWithVariants) {
        console.log(`${asset.baseId}: ${asset.variants.length} variants`);
        console.log(`  Base: ${asset.basePath}`);
        console.log(`  Variants: ${asset.variants.map(v => v.id).join(', ')}`);
      }
    }
  } catch (err) {
    console.error('❌ Error generating manifest:', err);
  }
}

// Execute the script
createTestAssets().catch(console.error);
