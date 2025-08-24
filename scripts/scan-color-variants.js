#!/usr/bin/env node

/**
 * Scan Color Variants Script
 * 
 * This script scans the asset directory for color variants of character parts
 * and generates a color-variants.json file that contains all discovered variants.
 * 
 * Usage:
 * npm run scan-variants
 */

const fs = require('fs');
const path = require('path');

// Standard colors to assign hex codes
const STANDARD_COLORS = {
  // Neutral colors
  black: "#333333",
  white: "#FAFAFA",
  gray: "#808080",
  
  // Hair colors
  blonde: "#F0E68C",
  brown: "#8B4513",
  auburn: "#A52A2A",
  
  // Vibrant colors
  red: "#FF6347",
  pink: "#FF69B4",
  orange: "#FFA500",
  yellow: "#FFD700",
  green: "#228B22",
  blue: "#4169E1",
  purple: "#9370DB",
  
  // Skin tones
  fair: "#FDBCB4",
  light: "#EEA990",
  medium: "#C68642",
  olive: "#8D5524",
  deep: "#654321",
  dark: "#3C2414",
};

// Human-readable color names
const COLOR_DISPLAY_NAMES = {
  black: "Black",
  white: "White", 
  gray: "Gray",
  blonde: "Blonde",
  brown: "Brown",
  auburn: "Auburn",
  red: "Red",
  pink: "Pink",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  fair: "Fair",
  light: "Light",
  medium: "Medium",
  olive: "Olive",
  deep: "Deep",
  dark: "Dark",
  
  // Add custom color name mappings here
  darkRed: "Dark Red",
  lightBlue: "Light Blue",
  pastelPink: "Pastel Pink",
  navy: "Navy Blue",
  wineRed: "Wine Red",
  mutedRed: "Muted Red"
};

// Configuration
const CONFIG = {
  assetPath: path.join(process.cwd(), 'public', 'assets', 'character'),
  outputPath: path.join(process.cwd(), 'public', 'assets', 'color-variants.json'),
  partFolderMap: {
    'body': 'body/body',
    'clothes': 'body/clothes',
    'hairBehind': 'hair/hair-behind',
    'hairFront': 'hair/hair-front',
    'eyes': 'face/eyes',
    'eyebrows': 'face/eyebrows', 
    'mouth': 'face/mouth',
    'blush': 'face/blush',
    'earring': 'accessories/earring',
    'glasses': 'accessories/glasses'
  }
};

/**
 * Extract color variant information from a filename
 */
function extractColorVariantInfo(filename) {
  // First extract the part type (hair-front, mouth, etc.)
  const partMatch = filename.match(/^(hair-front|hair-behind|mouth|eyes|body|clothes|blush|glasses|earring|eyebrows)-/)
  const partType = partMatch ? partMatch[1] : null
  
  // Remove the part prefix to get the style ID and any color
  const withoutPartPrefix = filename.replace(/^[^-]+-/, '')
  
  // Get the base ID and color (if any)
  const segments = withoutPartPrefix.replace(/\.png$/, '').split('-')
  
  if (segments.length === 1) {
    // No color variant, just a base style
    return {
      baseId: segments[0], 
      colorName: null,
      partType
    }
  } else {
    // Last segment is the color name
    const colorName = segments.pop() || null
    // Everything else is the base ID
    const baseId = segments.join('-')
    
    return {
      baseId,
      colorName, 
      partType
    }
  }
}

/**
 * Scan a directory for all PNG files
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    return [];
  }
  
  const files = fs.readdirSync(dirPath);
  return files.filter(file => file.endsWith('.png'));
}

/**
 * Group files by base ID and collect color variants
 */
function groupFilesByBase(files, partType) {
  const groups = {};
  
  files.forEach(file => {
    const { baseId, colorName } = extractColorVariantInfo(file);
    
    if (!groups[baseId]) {
      groups[baseId] = {
        baseFile: null,
        variants: []
      };
    }
    
    // If this is a base file (no color variant)
    if (!colorName) {
      groups[baseId].baseFile = file;
    } else {
      groups[baseId].variants.push({
        file,
        color: colorName,
        colorHex: STANDARD_COLORS[colorName] || '#666666',
        displayName: COLOR_DISPLAY_NAMES[colorName] || colorName.charAt(0).toUpperCase() + colorName.slice(1)
      });
    }
  });
  
  return groups;
}

/**
 * Scan all part directories and collect color variants
 */
async function scanAllParts() {
  const result = {};
  
  for (const [partKey, partPath] of Object.entries(CONFIG.partFolderMap)) {
    console.log(`Scanning ${partKey}...`);
    
    const fullPath = path.join(CONFIG.assetPath, partPath);
    const files = scanDirectory(fullPath);
    
    const groupedFiles = groupFilesByBase(files, partKey);
    result[partKey] = groupedFiles;
    
    // Print results for this part
    console.log(`  Found ${Object.keys(groupedFiles).length} base styles`);
    
    for (const [baseId, data] of Object.entries(groupedFiles)) {
      console.log(`    ${baseId}: ${data.variants.length} color variants`);
    }
  }
  
  return result;
}

/**
 * Save results to JSON file
 */
function saveResults(results) {
  fs.writeFileSync(
    CONFIG.outputPath,
    JSON.stringify(results, null, 2)
  );
  console.log(`Results saved to ${CONFIG.outputPath}`);
}

// Main execution
console.log('Starting color variant scan...');
scanAllParts()
  .then(results => saveResults(results))
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error));
