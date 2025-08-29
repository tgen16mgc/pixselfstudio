#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Define the folder structure
const folderStructure = {
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
  'accessories/hat': 'hat',
}

function updateAssetManifest() {
  const assetsPath = path.join(__dirname, '..', 'public', 'assets', 'character')
  const manifestPath = path.join(__dirname, '..', 'public', 'assets', 'asset-manifest.json')
  
  const manifest = {}

  console.log('🔍 Scanning asset folders...')

  // Scan each folder for PNG files
  for (const [folderPath, partKey] of Object.entries(folderStructure)) {
    const fullFolderPath = path.join(assetsPath, folderPath)
    
    try {
      if (fs.existsSync(fullFolderPath)) {
        const files = fs.readdirSync(fullFolderPath)
        const pngFiles = files.filter(file => 
          file.toLowerCase().endsWith('.png') && 
          fs.statSync(path.join(fullFolderPath, file)).isFile()
        )
        
        manifest[partKey] = pngFiles
        console.log(`  ✅ ${partKey}: found ${pngFiles.length} assets`)
        
        if (pngFiles.length > 0) {
          pngFiles.forEach(file => console.log(`     - ${file}`))
        }
      } else {
        manifest[partKey] = []
        console.log(`  ⚠️  ${partKey}: folder not found (${fullFolderPath})`)
      }
    } catch (error) {
      console.error(`  ❌ ${partKey}: error scanning folder`, error.message)
      manifest[partKey] = []
    }
  }

  // Write the updated manifest
  try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('\n✅ Asset manifest updated successfully!')
    console.log(`📄 Manifest saved to: ${manifestPath}`)
    
    // Show summary
    const totalAssets = Object.values(manifest).reduce((sum, assets) => sum + assets.length, 0)
    console.log(`\n📊 Summary: ${totalAssets} total assets across ${Object.keys(manifest).length} parts`)
    
  } catch (error) {
    console.error('\n❌ Failed to write manifest file:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  updateAssetManifest()
}

module.exports = { updateAssetManifest }
