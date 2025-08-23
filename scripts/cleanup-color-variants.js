#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Color variants that should be removed from base assets
const COLOR_VARIANTS = {
  hair: ["black", "white", "pink", "yellow", "red", "wineRed", "purple", "blue", "brown"],
  body: ["fair", "light", "medium", "olive", "deep", "dark"],
  clothes: ["red", "blue", "green", "yellow", "purple", "orange"],
  eyes: ["brown", "blue", "green", "gray", "purple", "red"],
  mouth: ["darkRed", "red", "mutedRed", "orange", "pink", "purple"]
}

// Parts that had color variants generated
const COLORABLE_PARTS = ['hairFront', 'hairBehind', 'body', 'clothes', 'eyes', 'mouth']

function isColorVariant(assetId, partKey) {
  const colorVariants = COLOR_VARIANTS[partKey === 'hairFront' || partKey === 'hairBehind' ? 'hair' : partKey] || COLOR_VARIANTS.hair
  
  return colorVariants.some(color => assetId.endsWith(`-${color}`))
}

function cleanupCharacterAssets() {
  console.log('🧹 Cleaning up auto-generated color variants from character assets...')
  
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
  
  // Parse and clean up each part
  const cleanedParts = []
  const partRegex = /\{\s*key:\s*"([^"]+)",[\s\S]*?assets:\s*\[([\s\S]*?)\],[\s\S]*?\}/g
  let match
  
  while ((match = partRegex.exec(partsSection)) !== null) {
    const partKey = match[1]
    const assetsSection = match[2]
    
    console.log(`  📝 Processing part: ${partKey}`)
    
    // Parse assets
    const assetRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*path:\s*"([^"]*)",\s*enabled:\s*(true|false)[\s\S]*?\}/g
    const cleanedAssets = []
    let assetMatch
    let removedCount = 0
    
    // Filter out auto-generated color variants
    while ((assetMatch = assetRegex.exec(assetsSection)) !== null) {
      const assetId = assetMatch[1]
      const assetName = assetMatch[2]
      const assetPath = assetMatch[3]
      const assetEnabled = assetMatch[4] === 'true'
      
      // Check if this is an auto-generated color variant
      if (COLORABLE_PARTS.includes(partKey) && isColorVariant(assetId, partKey)) {
        // This is an auto-generated color variant, skip it
        removedCount++
        console.log(`    🗑️  Removing auto-generated variant: ${assetId}`)
      } else {
        // This is a base asset, keep it
        cleanedAssets.push({
          id: assetId,
          name: assetName,
          path: assetPath,
          enabled: assetEnabled
        })
      }
    }
    
    console.log(`    ✅ Kept ${cleanedAssets.length} base assets, removed ${removedCount} auto-generated variants`)
    
    // Reconstruct the part with cleaned assets
    const cleanedPart = `  {
    key: "${partKey}",
    label: "${getPartLabel(partKey)}",
    icon: "${getPartIcon(partKey)}",
    category: "${getPartCategory(partKey)}",
    assets: [
${cleanedAssets.map(asset => `    {
      id: "${asset.id}",
      name: "${asset.name}",
      path: "${asset.path}",
      enabled: ${asset.enabled},
    }`).join(',\n')}
    ],
    defaultAsset: "${getDefaultAsset(partKey)}",
    optional: ${isOptional(partKey)},
  }`
    
    cleanedParts.push(cleanedPart)
  }
  
  // Update the config file
  const newConfigContent = configContent.substring(0, startIndex + startMarker.length) + 
    '\n' + cleanedParts.join(',\n') + '\n' + 
    configContent.substring(endIndex)
  
  fs.writeFileSync(configPath, newConfigContent, 'utf8')
  
  console.log('✅ Character assets cleaned up!')
  console.log('📋 Auto-generated color variants have been removed.')
  console.log('📋 Only base assets remain - color variants will be generated dynamically based on existing files.')
  
  return true
}

// Helper functions (same as in add-color-variants.js)
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
  return icons[partKey] || "🎨"
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
  return partKey !== "body"
}

// Run the script
if (require.main === module) {
  try {
    const success = cleanupCharacterAssets()
    if (!success) {
      console.log('ℹ️  No changes made to character assets.')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Error cleaning up character assets:', error)
    process.exit(1)
  }
}

module.exports = { cleanupCharacterAssets }