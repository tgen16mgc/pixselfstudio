#!/usr/bin/env node

/**
 * Asset Change Detector
 * This script checks for newly added or removed character part assets and updates configurations accordingly.
 * 
 * It works by:
 * 1. Scanning the asset directories
 * 2. Comparing with the existing asset registry
 * 3. Reporting changes
 * 4. Updating configuration files if requested
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ASSETS_BASE_PATH = path.join(__dirname, '..', 'public', 'assets', 'character');
const PART_FOLDERS = {
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
};

// Color patterns for variant detection
const COLOR_PATTERNS = [
  'black', 'brown', 'blonde', 'red', 'purple', 'blue', 'pink', 'white', 'yellow', 'wineRed',
  'fair', 'light', 'medium', 'olive', 'deep', 'dark', 'gold', 'silver', 'green', 'gray', 'orange'
];

/**
 * Check if a file is a color variant
 */
function isColorVariant(filename) {
  const colorPattern = COLOR_PATTERNS.join('|');
  return new RegExp(`-(${colorPattern})\\.(png|jpg|jpeg|svg)$`, 'i').test(filename);
}

/**
 * Extract the base asset name from a filename
 */
function extractBaseAssetName(filename, partKey) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '');
  
  // Remove part prefix (e.g., "hair-front-" -> "")
  const partPrefix = partKey.replace(/([A-Z])/g, '-$1').toLowerCase();
  const withoutPrefix = nameWithoutExt.replace(new RegExp(`^${partPrefix}-`), '');
  
  // Extract base name (before color suffix)
  const colorPattern = COLOR_PATTERNS.join('|');
  const baseName = withoutPrefix.replace(new RegExp(`-(${colorPattern})$`), '');
  
  return baseName || 'default';
}

/**
 * Scan a folder for assets
 */
function scanFolderForAssets(folderPath) {
  try {
    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      console.log(`  ⚠️  Folder not found: ${folderPath}`);
      return [];
    }
    
    // Get all PNG files
    const files = fs.readdirSync(folderPath);
    return files.filter(file => file.endsWith('.png'));
  } catch (error) {
    console.error(`Error scanning folder ${folderPath}:`, error);
    return [];
  }
}

/**
 * Load the current asset registry
 */
function loadCurrentAssetRegistry() {
  try {
    const registryPath = path.join(__dirname, '..', 'public', 'asset-registry.json');
    if (fs.existsSync(registryPath)) {
      const registryContent = fs.readFileSync(registryPath, 'utf8');
      return JSON.parse(registryContent);
    }
    return { parts: {} };
  } catch (error) {
    console.error('Error loading asset registry:', error);
    return { parts: {} };
  }
}

/**
 * Compare current assets with the registry
 */
function detectAssetChanges() {
  console.log('🔍 Checking for asset changes...\n');
  
  const currentRegistry = loadCurrentAssetRegistry();
  const changes = {
    added: {},
    removed: {},
    hasChanges: false
  };
  
  // Scan each part folder
  for (const [folderPath, partKey] of Object.entries(PART_FOLDERS)) {
    const fullFolderPath = path.join(ASSETS_BASE_PATH, folderPath);
    const currentAssets = scanFolderForAssets(fullFolderPath);
    
    // Group by base asset (ignoring color variants)
    const currentBaseAssets = new Set();
    currentAssets.forEach(filename => {
      if (!isColorVariant(filename)) {
        const baseAsset = extractBaseAssetName(filename, partKey);
        currentBaseAssets.add(baseAsset);
      }
    });
    
    // Get registered assets
    const registeredAssets = new Set();
    if (currentRegistry.parts[partKey] && Array.isArray(currentRegistry.parts[partKey].assets)) {
      currentRegistry.parts[partKey].assets.forEach(asset => {
        if (asset.id !== 'none') {
          registeredAssets.add(asset.id);
        }
      });
    }
    
    // Find added assets
    const addedAssets = [...currentBaseAssets].filter(asset => !registeredAssets.has(asset));
    if (addedAssets.length > 0) {
      changes.added[partKey] = addedAssets;
      changes.hasChanges = true;
    }
    
    // Find removed assets
    const removedAssets = [...registeredAssets].filter(asset => !currentBaseAssets.has(asset));
    if (removedAssets.length > 0) {
      changes.removed[partKey] = removedAssets;
      changes.hasChanges = true;
    }
  }
  
  return changes;
}

/**
 * Display changes in a user-friendly format
 */
function displayChanges(changes) {
  console.log('📋 Asset Changes Summary:');
  
  if (!changes.hasChanges) {
    console.log('  ✓ No changes detected. All assets are up-to-date.\n');
    return;
  }
  
  // Display added assets
  const addedParts = Object.keys(changes.added);
  if (addedParts.length > 0) {
    console.log('\n✅ New assets found:');
    addedParts.forEach(partKey => {
      console.log(`  ${partKey}:`);
      changes.added[partKey].forEach(asset => {
        console.log(`    - ${asset}`);
      });
    });
  }
  
  // Display removed assets
  const removedParts = Object.keys(changes.removed);
  if (removedParts.length > 0) {
    console.log('\n❌ Removed assets:');
    removedParts.forEach(partKey => {
      console.log(`  ${partKey}:`);
      changes.removed[partKey].forEach(asset => {
        console.log(`    - ${asset}`);
      });
    });
  }
  
  console.log('\n');
}

/**
 * Update asset configurations based on detected changes
 */
function updateAssetConfigurations() {
  try {
    console.log('⚙️  Updating asset configurations...');
    
    // Run the existing scripts in sequence
    console.log('\n📋 Generating asset registry...');
    execSync('node scripts/generate-asset-registry.js', { stdio: 'inherit' });
    
    console.log('\n⚡ Updating static configuration...');
    execSync('node scripts/update-static-config.js', { stdio: 'inherit' });
    
    console.log('\n✅ Asset configurations updated successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error updating asset configurations:', error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Character Asset Change Detector');
  console.log('==================================\n');
  
  // Detect changes
  const changes = detectAssetChanges();
  
  // Display changes
  displayChanges(changes);
  
  // If changes were detected, ask to update
  if (changes.hasChanges) {
    console.log('Changes were detected in your character assets.');
    
    // In a real interactive script, we'd ask for confirmation here
    // Since we're running this programmatically, we'll just proceed
    const updated = updateAssetConfigurations();
    
    if (updated) {
      console.log('🎉 All assets have been updated and are ready to use!');
      console.log('🔄 Restart your development server to see the changes.');
    } else {
      console.log('⚠️  Asset configuration update was not completed.');
    }
  }
}

// Run the main function
main();
