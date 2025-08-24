#!/usr/bin/env node

/**
 * Script to update the asset paths in the application
 * This will update the asset-path-resolver.ts file to use the new standardized paths
 */

const fs = require('fs');
const path = require('path');

// Define the path to the asset-path-resolver.ts file
const resolverPath = path.join(process.cwd(), 'utils/asset-path-resolver.ts');
const manifestPath = path.join(process.cwd(), 'public/assets/asset-manifest.json');

// New path structure that simplifies folder paths
const NEW_PART_PATH_MAP = {
  'hairFront': { folderPath: 'hair/front', filePrefix: '' },
  'hairBehind': { folderPath: 'hair/behind', filePrefix: '' },
  'body': { folderPath: 'body/body', filePrefix: '' },
  'clothes': { folderPath: 'body/clothes', filePrefix: '' },
  'eyes': { folderPath: 'face/eyes', filePrefix: '' },
  'eyebrows': { folderPath: 'face/eyebrows', filePrefix: '' },
  'mouth': { folderPath: 'face/mouth', filePrefix: '' },
  'blush': { folderPath: 'face/blush', filePrefix: '' },
  'glasses': { folderPath: 'accessories/glasses', filePrefix: '' },
  'earring': { folderPath: 'accessories/earring', filePrefix: '' },
};

/**
 * Update the asset path resolver to use the new standardized paths
 */
async function updateAssetPathResolver() {
  console.log('📝 Updating asset path resolver...');

  try {
    // Read the current content of the resolver file
    const content = fs.readFileSync(resolverPath, 'utf8');
    
    // Replace the PART_PATH_MAP definition
    const updatedContent = content.replace(
      /const PART_PATH_MAP[^}]+(};)/s,
      `const PART_PATH_MAP: Record<string, { folderPath: string, filePrefix: string }> = ${JSON.stringify(NEW_PART_PATH_MAP, null, 2)};`
    );
    
    // Update path resolution logic
    const simplifiedPathLogic = updatedContent.replace(
      /\/\/ Now try to construct the path[^}]+(  return constructedPath;)/s,
      `// Now try to construct the path based on our knowledge of the file structure
  let constructedPath: string;
  
  // For base assets without color variants
  if (assetId.includes('-')) {
    // For color variants
    constructedPath = \`/assets/character/\${pathInfo.folderPath}/\${assetId}.png\`;
  } else {
    // For base assets
    constructedPath = \`/assets/character/\${pathInfo.folderPath}/\${assetId}.png\`;
  }
  
  DEBUG && console.log(\`🔧 Constructed path: \${constructedPath}\`);
  
  // Cache and return the constructed path
  pathCache[cacheKey] = constructedPath;
  return constructedPath;`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(resolverPath, simplifiedPathLogic, 'utf8');
    console.log('✅ Updated asset path resolver');
    
  } catch (err) {
    console.error('❌ Failed to update asset path resolver:', err);
  }
}

/**
 * Update the asset manifest to use the new asset IDs
 */
async function updateAssetManifest() {
  console.log('\n📝 Updating asset manifest...');
  
  try {
    // Check if the manifest file exists
    if (!fs.existsSync(manifestPath)) {
      console.log('⚠️ Asset manifest not found, skipping update');
      return;
    }
    
    // Read the current asset manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Define the mapping of old asset IDs to new ones
    const idMapping = {
      'hairFront': {
        'hair-front-2side': '2side',
        'hair-front-2side-blue': '2side-blue',
        'hair-front-2side-purple': '2side-purple',
        'hair-front-2side-red': '2side-red',
        'hair-front-64': '64',
        'hair-front-long37': 'long37',
        'hair-front-tomboy': 'tomboy',
        'hair-front-tomboy-black': 'tomboy-black',
        'hair-front-tomboy-blonde': 'tomboy-blonde',
        'hair-front-tomboy-brown': 'tomboy-brown',
      },
      'hairBehind': {
        'hair-behind-2side': '2side',
        'hair-behind-curly': 'curly',
      },
      'body': {
        'body-default': 'default',
        'body-v2': 'v2',
      },
      'clothes': {
        'clothes-aotheneu': 'aotheneu',
        'clothes-dress1': 'dress1',
        'clothes-neu': 'neu',
        'clothes-somi': 'somi',
      },
      'eyes': {
        'eyes-basic1': 'basic1',
        'eyes-default': 'default',
        'eyes-default-blue': 'default-blue',
        'eyes-default-green': 'default-green',
        'eyes-medium': 'medium',
      },
      'eyebrows': {
        'eyebrows-curved': 'curved',
        'eyebrows-default': 'default',
        'eyebrows-flat': 'flat',
      },
      'mouth': {
        'mouth-default': 'default',
        'mouth-small': 'small',
        'mouth-smile': 'smile',
        'mouth-smile-pink': 'smile-pink',
      },
      'blush': {
        'blush-default': 'default',
        'blush-light': 'light',
        'blush-soft': 'soft',
      },
      'glasses': {
        'glasses-default': 'default',
      },
      'earring': {
        'earring-default': 'default',
        'earring-helixmix': 'helixmix',
      },
    };
    
    // Update each part in the manifest
    Object.keys(manifest).forEach(partKey => {
      if (idMapping[partKey]) {
        // Replace old asset IDs with new ones
        const newAssets = manifest[partKey].map(oldAssetId => {
          return idMapping[partKey][oldAssetId] || oldAssetId;
        });
        
        manifest[partKey] = newAssets;
      }
    });
    
    // Write the updated manifest back to the file
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('✅ Updated asset manifest');
    
  } catch (err) {
    console.error('❌ Failed to update asset manifest:', err);
  }
}

/**
 * Run all updates
 */
async function updateAll() {
  console.log('🔄 Starting asset path updates...\n');
  
  await updateAssetPathResolver();
  await updateAssetManifest();
  
  console.log('\n✅ All asset path updates complete!');
  console.log('\nReminder: You may need to update any hardcoded asset paths in your application code.');
}

// Execute the updates
updateAll().catch(console.error);
