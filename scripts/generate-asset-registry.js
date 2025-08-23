#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Define the folder structure mapping
const FOLDER_STRUCTURE = {
  'body/body': 'body',
  'body/clothes': 'clothes', 
  'hair/hair-behind': 'hairBehind',
  'hair/hair-front': 'hairFront',
  'face/eyes': 'eyes',
  'face/eyebrows': 'eyebrows',
  'face/mouth': 'mouth',
  'face/blush': 'blush',
  'accessories/earring': 'earring',
  'accessories/glasses': 'glasses',
}

// Color patterns for variant detection
const COLOR_PATTERNS = [
  'black', 'brown', 'blonde', 'red', 'purple', 'blue', 'pink', 'white', 'yellow', 'wineRed',
  'fair', 'light', 'medium', 'olive', 'deep', 'dark', 'gold', 'silver', 'green', 'gray', 'orange'
]

// Part configurations
const PART_CONFIGS = {
  body: {
    label: "BODY",
    icon: "👤",
    category: "Body",
    defaultAsset: "default",
    optional: false,
    colorSupport: true,
  },
  clothes: {
    label: "CLOTHES",
    icon: "👕",
    category: "Body",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  hairBehind: {
    label: "HAIR BEHIND",
    icon: "🎭",
    category: "Hair",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  hairFront: {
    label: "HAIR FRONT",
    icon: "💇",
    category: "Hair",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  eyes: {
    label: "EYES",
    icon: "👀",
    category: "Face",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  eyebrows: {
    label: "EYEBROWS",
    icon: "🤨",
    category: "Face",
    defaultAsset: "default",
    optional: true,
    colorSupport: false,
  },
  mouth: {
    label: "MOUTH",
    icon: "👄",
    category: "Face",
    defaultAsset: "default",
    optional: true,
    colorSupport: false,
  },
  blush: {
    label: "BLUSH",
    icon: "😊",
    category: "Face",
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
  },
  earring: {
    label: "EARRING",
    icon: "💎",
    category: "Accessories",
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
  },
  glasses: {
    label: "GLASSES",
    icon: "🤓",
    category: "Accessories",
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
  },
}

function extractBaseAssetName(filename, partKey) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '')
  
  // Remove part prefix (e.g., "hair-front-" -> "")
  const partPrefix = partKey.replace(/([A-Z])/g, '-$1').toLowerCase()
  const withoutPrefix = nameWithoutExt.replace(new RegExp(`^${partPrefix}-`), '')
  
  // Extract base name (before color suffix)
  const colorPattern = COLOR_PATTERNS.join('|')
  const baseName = withoutPrefix.replace(new RegExp(`-(${colorPattern})$`), '')
  
  return baseName || 'default'
}

function extractColorFromFilename(filename, partKey) {
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '')
  const colorPattern = COLOR_PATTERNS.join('|')
  const colorMatch = nameWithoutExt.match(new RegExp(`-(${colorPattern})$`))
  return colorMatch ? colorMatch[1] : null
}

function generateAssetName(baseName, partLabel) {
  if (baseName === 'default') {
    return `Default ${partLabel}`
  }
  
  // Convert kebab-case to Title Case
  return baseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function generateVariantName(baseName, partLabel, colorId) {
  const baseNameFormatted = generateAssetName(baseName, partLabel)
  const colorName = colorId.charAt(0).toUpperCase() + colorId.slice(1)
  return `${baseNameFormatted} (${colorName})`
}

function processAssetsForPart(folderPath, partKey, filenames, config) {
  const assets = []
  const assetGroups = new Map()

  // Group files by base asset name
  for (const filename of filenames) {
    const baseName = extractBaseAssetName(filename, partKey)
    if (!assetGroups.has(baseName)) {
      assetGroups.set(baseName, [])
    }
    assetGroups.get(baseName).push(filename)
  }

  // Create asset definitions with variants
  for (const [baseName, files] of assetGroups) {
    const variants = []
    
    for (const filename of files) {
      const colorId = extractColorFromFilename(filename, partKey)
      const variantId = colorId ? `${baseName}-${colorId}` : baseName
      
      const variantName = colorId 
        ? generateVariantName(baseName, config.label, colorId)
        : generateAssetName(baseName, config.label)

      variants.push({
        id: variantId,
        name: variantName,
        color: colorId || undefined,
        path: `/assets/character/${folderPath}/${filename}`,
        enabled: true,
      })
    }

    if (variants.length > 0) {
      // Find default variant (prefer original, then first)
      const defaultVariant = variants.find(v => !v.color) || variants[0]
      
      const asset = {
        id: baseName,
        name: generateAssetName(baseName, config.label),
        basePath: `/assets/character/${folderPath}`,
        enabled: true,
        variants,
        defaultVariant: defaultVariant.id,
      }

      assets.push(asset)
    }
  }

  return assets
}

function generateAssetRegistry() {
  const assetsPath = path.join(__dirname, '..', 'public', 'assets', 'character')
  const registryPath = path.join(__dirname, '..', 'public', 'assets', 'asset-registry.json')
  
  const registry = {
    version: "2.0.0",
    generated: new Date().toISOString(),
    parts: {},
    metadata: {
      totalAssets: 0,
      totalVariants: 0,
      lastUpdated: new Date().toISOString(),
    }
  }

  console.log('🔍 Scanning asset folders...')

  let totalAssets = 0
  let totalVariants = 0

  // Process each part
  for (const [folderPath, partKey] of Object.entries(FOLDER_STRUCTURE)) {
    const config = PART_CONFIGS[partKey]
    const fullFolderPath = path.join(assetsPath, folderPath)
    
    try {
      if (fs.existsSync(fullFolderPath)) {
        const files = fs.readdirSync(fullFolderPath)
        const pngFiles = files.filter(file => 
          file.toLowerCase().endsWith('.png') && 
          fs.statSync(path.join(fullFolderPath, file)).isFile()
        )
        
        const assets = []
        
        // Add "none" option for optional parts
        if (config.optional) {
          assets.push({
            id: "none",
            name: `No ${config.label}`,
            basePath: "",
            enabled: true,
            variants: [{
              id: "none",
              name: "None",
              path: "",
              enabled: true,
            }],
            defaultVariant: "none",
          })
        }

        // Process assets for this part
        const processedAssets = processAssetsForPart(folderPath, partKey, pngFiles, config)
        assets.push(...processedAssets)
        
        totalAssets += assets.length
        totalVariants += assets.reduce((sum, asset) => sum + asset.variants.length, 0)

        // Create part definition
        registry.parts[partKey] = {
          key: partKey,
          label: config.label,
          icon: config.icon,
          category: config.category,
          assets,
          defaultAsset: config.defaultAsset,
          optional: config.optional,
          colorSupport: config.colorSupport,
        }

        console.log(`  ✅ ${partKey}: found ${assets.length} assets with ${assets.reduce((sum, asset) => sum + asset.variants.length, 0)} variants`)
        
      } else {
        console.log(`  ⚠️  ${partKey}: folder not found (${fullFolderPath})`)
        
        // Create empty part with "none" option
        if (config.optional) {
          registry.parts[partKey] = {
            key: partKey,
            label: config.label,
            icon: config.icon,
            category: config.category,
            assets: [{
              id: "none",
              name: `No ${config.label}`,
              basePath: "",
              enabled: true,
              variants: [{
                id: "none",
                name: "None",
                path: "",
                enabled: true,
              }],
              defaultVariant: "none",
            }],
            defaultAsset: config.defaultAsset,
            optional: config.optional,
            colorSupport: config.colorSupport,
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ ${partKey}: error scanning folder`, error.message)
    }
  }

  // Update metadata
  registry.metadata.totalAssets = totalAssets
  registry.metadata.totalVariants = totalVariants

  // Write the registry file
  try {
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))
    console.log('\n✅ Asset registry generated successfully!')
    console.log(`📄 Registry saved to: ${registryPath}`)
    console.log(`\n📊 Summary: ${totalAssets} total assets with ${totalVariants} variants`)
    
    // Also update the legacy manifest for backward compatibility
    const manifestPath = path.join(__dirname, '..', 'public', 'assets', 'asset-manifest.json')
    const legacyManifest = {}
    
    for (const [partKey, part] of Object.entries(registry.parts)) {
      legacyManifest[partKey] = part.assets
        .filter(asset => asset.id !== 'none')
        .flatMap(asset => asset.variants)
        .filter(variant => variant.id !== 'none')
        .map(variant => variant.path.split('/').pop())
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(legacyManifest, null, 2))
    console.log(`📄 Legacy manifest updated: ${manifestPath}`)
    
  } catch (error) {
    console.error('\n❌ Failed to write registry file:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  generateAssetRegistry()
}

module.exports = { generateAssetRegistry }