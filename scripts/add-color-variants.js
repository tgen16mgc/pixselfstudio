#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Color variants for different parts
const COLOR_VARIANTS = {
  hair: {
    black: "#2C1810",
    brown: "#8B4513", 
    blonde: "#DAA520",
    red: "#DC143C",
    purple: "#9370DB",
    blue: "#00CED1"
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

function addColorVariantsToAsset(asset, partKey) {
  const colorVariants = COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair
  
  // Keep the original asset
  const variants = [asset]
  
  // Add color variants
  Object.entries(colorVariants).forEach(([colorName, colorHex]) => {
    const colorVariant = {
      ...asset,
      id: `${asset.id}-${colorName}`,
      name: `${asset.name} (${colorName.charAt(0).toUpperCase() + colorName.slice(1)})`,
      path: asset.path.replace('.png', `-${colorName}.png`),
      color: colorHex,
      enabled: true
    }
    variants.push(colorVariant)
  })
  
  return variants
}

function updateCharacterAssetsWithColorVariants() {
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
    const assets = []
    let assetMatch
    
    while ((assetMatch = assetRegex.exec(assetsSection)) !== null) {
      const asset = {
        id: assetMatch[1],
        name: assetMatch[2],
        path: assetMatch[3],
        enabled: assetMatch[4] === 'true'
      }
      
      // Add color variants for colorable parts (except "none" assets)
      if (COLORABLE_PARTS.includes(partKey) && asset.id !== 'none') {
        // Check if this asset already has color variants
        const hasColorVariants = asset.id.includes('-') && 
          Object.keys(COLOR_VARIANTS[partKey] || COLOR_VARIANTS.hair).some(color => 
            asset.id.endsWith(`-${color}`)
          )
        
        if (!hasColorVariants) {
          const variants = addColorVariantsToAsset(asset, partKey)
          assets.push(...variants)
          console.log(`    ✅ Added ${variants.length - 1} color variants to ${asset.id}`)
        } else {
          assets.push(asset)
          console.log(`    ℹ️  ${asset.id} already has color variants`)
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
  try {
    const success = updateCharacterAssetsWithColorVariants()
    if (!success) {
      console.log('ℹ️  No changes made to character assets.')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Error updating character assets:', error)
    process.exit(1)
  }
}

module.exports = { addColorVariantsToAsset, COLOR_VARIANTS }
