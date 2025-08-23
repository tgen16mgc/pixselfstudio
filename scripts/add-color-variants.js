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

// GitHub CDN configuration
const GITHUB_CONFIG = {
  username: 'tgen16mgc',
  repo: 'pixselfstudio',
  branch: 'main',
  basePath: 'public/assets/character'
}

function generateCDNUrl(assetPath) {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${assetPath}`
}

async function checkAssetExists(assetPath) {
  try {
    // In development/build environment, be more conservative about what exists
    // Only allow existing assets that we know are real
    const knownAssets = [
      'hair-front-tomboy-brown.png',
      // Note: hair-front-tomboy-black.png removed since it doesn't exist
      'hair-behind-curly-black.png',
      'body-default-fair.png',
      'body-default-light.png',
      'body-default-medium.png'
    ]
    
    const filename = assetPath.split('/').pop()
    if (knownAssets.includes(filename)) {
      return true
    }
    
    // For network requests, use a short timeout and be conservative
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch(assetPath, { 
      method: 'HEAD',
      signal: controller.signal 
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

async function addColorVariantsToAsset(asset, partKey) {
  const colorVariants = COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair
  const variants = []
  
  // For hair parts, make black the default variant
  if (partKey === 'hairFront' || partKey === 'hairBehind') {
    // Check which color variants actually exist
    for (const [colorName, colorHex] of Object.entries(colorVariants)) {
      const colorVariantPath = generateCDNUrlForColorVariant(asset.path, colorName)
      const exists = await checkAssetExists(colorVariantPath)
      
      if (exists) {
        const colorVariant = {
          ...asset,
          id: `${asset.id}-${colorName}`,
          name: `${asset.name} (${colorName.charAt(0).toUpperCase() + colorName.slice(1)})`,
          path: colorVariantPath,
          color: colorHex,
          enabled: true
        }
        
        // Add black variant first if it exists
        if (colorName === 'black') {
          variants.unshift(colorVariant)
        } else {
          variants.push(colorVariant)
        }
      }
    }
    
    return variants
  } else {
    // For non-hair parts, check which color variants actually exist
    const variants = []
    
    // First, add the base asset only if no color variants exist
    let hasColorVariants = false
    
    // Check for existing color variants
    for (const [colorName, colorHex] of Object.entries(colorVariants)) {
      const colorVariantPath = generateCDNUrlForColorVariant(asset.path, colorName)
      const exists = await checkAssetExists(colorVariantPath)
      
      if (exists) {
        hasColorVariants = true
        const colorVariant = {
          ...asset,
          id: `${asset.id}-${colorName}`,
          name: `${asset.name} (${colorName.charAt(0).toUpperCase() + colorName.slice(1)})`,
          path: colorVariantPath,
          color: colorHex,
          enabled: true
        }
        variants.push(colorVariant)
      }
    }
    
    // If no color variants exist, keep the original asset as-is
    if (!hasColorVariants) {
      variants.push(asset)
    }
    
    return variants
  }
}

function generateCDNUrlForColorVariant(originalPath, colorName) {
  // Extract the base path from the CDN URL
  const basePath = originalPath.replace(/\.png$/, '');
  return `${basePath}-${colorName}.png`;
}

async function updateCharacterAssetsWithColorVariants() {
  console.log('🎨 Adding color variants to character assets...')
  
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
    const assetRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*path:\s*"([^"]*)",\s*enabled:\s*(true|false)\s*\}/g
    const allAssets = []
    let assetMatch
    
    // First pass: collect all assets
    while ((assetMatch = assetRegex.exec(assetsSection)) !== null) {
      const asset = {
        id: assetMatch[1],
        name: assetMatch[2],
        path: assetMatch[3],
        enabled: assetMatch[4] === 'true'
      }
      allAssets.push(asset)
    }
    
    // Second pass: process assets and add color variants
    const assets = []
    const processedBaseAssets = new Set()
    
    // Sort assets so that base assets come before their color variants
    allAssets.sort((a, b) => {
      // Check if either asset is a color variant
      const aIsColorVariant = Object.keys(COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair).some(color => 
        a.id.endsWith(`-${color}`)
      )
      const bIsColorVariant = Object.keys(COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair).some(color => 
        b.id.endsWith(`-${color}`)
      )
      
      // Put base assets before color variants
      if (aIsColorVariant && !bIsColorVariant) return 1
      if (!aIsColorVariant && bIsColorVariant) return -1
      
      // If both are the same type, maintain original order
      return 0
    })
    
    for (const asset of allAssets) {
      // Add color variants for colorable parts (except "none" assets)
      if (COLORABLE_PARTS.includes(partKey) && asset.id !== 'none') {
        // Check if this asset is already a color variant
        const isColorVariant = Object.keys(COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair).some(color => 
          asset.id.endsWith(`-${color}`)
        )
        
        if (!isColorVariant) {
          // This is a base asset, check if we already processed it
          if (!processedBaseAssets.has(asset.id)) {
            // Add the base asset
            assets.push(asset)
            processedBaseAssets.add(asset.id)
            
            // Add color variants to it
            const variants = await addColorVariantsToAsset(asset, partKey)
            assets.push(...variants)
            console.log(`    ✅ Added ${variants.length} color variants to ${asset.id}`)
          }
        } else {
          // This is already a color variant, just add it as is
          assets.push(asset)
          console.log(`    ℹ️  ${asset.id} is a color variant, keeping as is`)
        }
      } else {
        assets.push(asset)
      }
    }
    
    // Reconstruct the part with updated assets
    const updatedPart = `  {
    key: "${partKey}",
    label: "${getPartLabel(partKey)}",
    icon: "${getPartIcon(partKey)}",
    category: "${getPartCategory(partKey)}",
    assets: [
${assets.map(asset => `    {
      id: "${asset.id}",
      name: "${asset.name}",
      path: "${asset.path}",
      enabled: ${asset.enabled},
${asset.color ? `      color: "${asset.color}",` : ''}
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
  
  console.log('✅ Character assets updated with color variants!')
  console.log('📋 Summary:')
  COLORABLE_PARTS.forEach(part => {
    const colorCount = Object.keys(COLOR_VARIANTS[part] || COLOR_VARIANTS.hair).length
    console.log(`  ${part}: ${colorCount} color variants available`)
  })
  
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
  (async () => {
    try {
      const success = await updateCharacterAssetsWithColorVariants()
      if (!success) {
        console.log('ℹ️  No changes made to character assets.')
        process.exit(0)
      }
    } catch (error) {
      console.error('❌ Error updating character assets:', error)
      process.exit(1)
    }
  })()
}

module.exports = { addColorVariantsToAsset, COLOR_VARIANTS }
