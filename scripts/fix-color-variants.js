#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Color variants for different parts
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
    brown: "#8B4513"
  },
  body: {
    fair: "#FDBCB4",
    light: "#EEA990", 
    medium: "#C68642",
    olive: "#8D5524",
    deep: "#654321",
    dark: "#3C2414"
  },
  clothes: {
    red: "#FF6B6B",
    blue: "#4ECDC4",
    green: "#45B7D1", 
    yellow: "#96CEB4",
    purple: "#FFEAA7",
    orange: "#DDA0DD"
  },
  eyes: {
    brown: "#8B4513",
    blue: "#4169E1",
    green: "#228B22",
    gray: "#808080",
    purple: "#9370DB",
    red: "#DC143C"
  },
  mouth: {
    darkRed: "#DC143C",
    red: "#FF6347",
    mutedRed: "#CD5C5C",
    orange: "#FF8C00",
    pink: "#FF69B4",
    purple: "#9370DB"
  }
}

// Parts that support color variants
const COLORABLE_PARTS = ['hairFront', 'hairBehind', 'body', 'clothes', 'eyes', 'mouth']

// Helper function to check if asset exists (simplified for script usage)
async function checkAssetExists(assetPath) {
  try {
    const response = await fetch(assetPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Helper function to extract base style from asset ID
function getBaseStyleId(assetId) {
  // Remove color suffixes to get base style
  const colorSuffixes = Object.keys(COLOR_VARIANTS.hair) // Use hair as it has most colors
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return assetId.slice(0, -(color.length + 1))
    }
  }
  return assetId
}

// Helper function to get color from asset ID
function getColorFromAssetId(assetId) {
  const colorSuffixes = Object.keys(COLOR_VARIANTS.hair)
  for (const color of colorSuffixes) {
    if (assetId.endsWith(`-${color}`)) {
      return color
    }
  }
  return null
}

function cleanupColorVariantsInConfig() {
  console.log('🧹 Cleaning up color variants in character assets config...')
  
  // Read the current character assets config
  const configPath = path.join(__dirname, '../config/character-assets.ts')
  let configContent = fs.readFileSync(configPath, 'utf8')
  
  // Find the FALLBACK_CHARACTER_PARTS array
  const startMarker = 'const FALLBACK_CHARACTER_PARTS: PartDefinition[] = ['
  const endMarker = ']'
  
  const startIndex = configContent.indexOf(startMarker)
  if (startIndex === -1) {
    console.error('❌ Could not find FALLBACK_CHARACTER_PARTS in config file')
    return false
  }
  
  const endIndex = configContent.indexOf(endMarker, startIndex + startMarker.length)
  if (endIndex === -1) {
    console.error('❌ Could not find end of FALLBACK_CHARACTER_PARTS array')
    return false
  }
  
  // Extract the current parts configuration
  const partsSection = configContent.substring(startIndex + startMarker.length, endIndex)
  
  // Parse and update each part
  const updatedParts = []
  const partRegex = /\{\s*key:\s*"([^"]+)",[\s\S]*?assets:\s*\[([\s\S]*?)\],[\s\S]*?\}/g
  let match
  
  while ((match = partRegex.exec(partsSection)) !== null) {
    const partKey = match[1]
    const assetsSection = match[2]
    
    console.log(`  📝 Processing part: ${partKey}`)
    
    // Parse assets
    const assetRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*path:\s*"([^"]*)",\s*enabled:\s*(true|false)[^}]*\}/g
    const allAssets = []
    let assetMatch
    
    // Collect all assets
    while ((assetMatch = assetRegex.exec(assetsSection)) !== null) {
      const asset = {
        id: assetMatch[1],
        name: assetMatch[2],
        path: assetMatch[3],
        enabled: assetMatch[4] === 'true'
      }
      allAssets.push(asset)
    }
    
    // Filter to only keep base styles (no color variants)
    const baseAssets = []
    const processedBaseIds = new Set()
    
    for (const asset of allAssets) {
      const baseId = getBaseStyleId(asset.id)
      const colorFromId = getColorFromAssetId(asset.id)
      
      // If this is a base asset (no color suffix) or we haven't seen this base yet
      if (!colorFromId) {
        // This is a base asset, keep it
        baseAssets.push(asset)
        processedBaseIds.add(baseId)
        console.log(`    ✅ Keeping base asset: ${asset.id}`)
      } else if (!processedBaseIds.has(baseId)) {
        // This is a color variant, but we haven't seen the base yet
        // Create a base asset from this variant
        const baseAsset = {
          id: baseId,
          name: asset.name.replace(/\s*\([^)]+\)$/, ''), // Remove color info from name
          path: asset.path.replace(/-[^-\.]+\.png$/, '.png'), // Remove color suffix from path
          enabled: asset.enabled
        }
        baseAssets.push(baseAsset)
        processedBaseIds.add(baseId)
        console.log(`    ✅ Created base asset from variant: ${baseId} (from ${asset.id})`)
      } else {
        console.log(`    ⏭️  Skipping duplicate color variant: ${asset.id}`)
      }
    }
    
    // Reconstruct the part with cleaned assets
    const updatedPart = `  {
    key: "${partKey}",
    label: "${getPartLabel(partKey)}",
    icon: "${getPartIcon(partKey)}",
    category: "${getPartCategory(partKey)}",
    assets: [
${baseAssets.map(asset => `    {
      id: "${asset.id}",
      name: "${asset.name}",
      path: "${asset.path}",
      enabled: ${asset.enabled},
    }`).join(',\n')}
    ],
    defaultAsset: "${getDefaultAsset(partKey)}",
    optional: ${isOptional(partKey)},
  }`
    
    updatedParts.push(updatedPart)
  }
  
  // Update the config file
  const newConfigContent = configContent.substring(0, startIndex + startMarker.length) + 
    '\n' + updatedParts.join(',\n') + '\n' + 
    configContent.substring(endIndex)
  
  fs.writeFileSync(configPath, newConfigContent, 'utf8')
  
  console.log('✅ Character assets config cleaned up!')
  console.log('📋 Summary: Removed placeholder color variants, kept only base styles')
  
  return true
}

// Helper functions
function getPartLabel(partKey) {
  const labels = {
    body: "BODY",
    clothes: "CLOTHES", 
    hairFront: "HAIR FRONT",
    hairBehind: "HAIR BEHIND",
    eyes: "EYES",
    eyebrows: "EYEBROWS",
    mouth: "MOUTH",
    blush: "BLUSH",
    earring: "EARRING",
    glasses: "GLASSES"
  }
  return labels[partKey] || partKey.toUpperCase()
}

function getPartIcon(partKey) {
  const icons = {
    body: "👤",
    clothes: "👕",
    hairFront: "💇",
    hairBehind: "🎭", 
    eyes: "👀",
    eyebrows: "🤨",
    mouth: "👄",
    blush: "😊",
    earring: "💎",
    glasses: "🤓"
  }
  return icons[partKey] || "🎭"
}

function getPartCategory(partKey) {
  const categories = {
    body: "Body",
    clothes: "Body",
    hairFront: "Hair",
    hairBehind: "Hair",
    eyes: "Face",
    eyebrows: "Face",
    mouth: "Face",
    blush: "Face",
    earring: "Accessories",
    glasses: "Accessories"
  }
  return categories[partKey] || "Body"
}

function getDefaultAsset(partKey) {
  const defaults = {
    body: "default",
    clothes: "default",
    hairFront: "default",
    hairBehind: "default",
    eyes: "default",
    eyebrows: "default",
    mouth: "default",
    blush: "none",
    earring: "none",
    glasses: "none"
  }
  return defaults[partKey] || "default"
}

function isOptional(partKey) {
  const optionalParts = ['clothes', 'hairFront', 'hairBehind', 'eyes', 'eyebrows', 'mouth', 'blush', 'earring', 'glasses']
  return optionalParts.includes(partKey)
}

// Main execution
if (require.main === module) {
  cleanupColorVariantsInConfig()
}

module.exports = { cleanupColorVariantsInConfig }