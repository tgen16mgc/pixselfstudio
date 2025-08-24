#!/usr/bin/env node

/**
 * Script to verify asset paths
 * This checks that all color variants are properly resolved
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

// Configuration
const BASE_PATH = '/assets/character';
const BASE_URL = 'http://localhost:3000'; // Update this if your dev server uses a different port

// Check if the server is running by making a quick request
async function checkServerRunning() {
  return new Promise(resolve => {
    http.get(`${BASE_URL}/favicon.ico`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Function to check if a path exists by making an HTTP request
async function checkPathExists(assetPath) {
  const fullUrl = `${BASE_URL}${assetPath}`;
  
  return new Promise(resolve => {
    http.get(fullUrl, (res) => {
      resolve({
        exists: res.statusCode === 200,
        statusCode: res.statusCode,
        path: assetPath
      });
    }).on('error', () => {
      resolve({
        exists: false,
        statusCode: 0,
        path: assetPath
      });
    });
  });
}

// Read manifest.json to get a list of assets
async function readManifest() {
  const manifestPath = path.join(process.cwd(), 'public/assets/asset-manifest.json');
  
  try {
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return manifest;
    } else {
      console.log('⚠️ Asset manifest not found');
      return {};
    }
  } catch (err) {
    console.error('❌ Failed to read asset manifest:', err);
    return {};
  }
}

// Generate all possible asset paths for verification
async function generateTestPaths() {
  const manifest = await readManifest();
  const testPaths = [];
  
  // Color variants defined in color-variants.ts
  const colorVariants = {
    hairFront: ['black', 'white', 'pink', 'yellow', 'red', 'purple', 'blue', 'brown'],
    hairBehind: ['black', 'white', 'pink', 'yellow', 'red', 'purple', 'blue', 'brown'],
    eyes: ['brown', 'blue', 'green', 'gray', 'purple', 'red'],
    mouth: ['darkRed', 'red', 'mutedRed', 'orange', 'pink', 'purple'],
  };
  
  // For each part in the manifest, generate standard and color variant paths
  for (const [partKey, assets] of Object.entries(manifest)) {
    // Get the folder path for this part
    let folderPath;
    
    if (partKey === 'hairFront') {
      folderPath = 'hair/front';
    } else if (partKey === 'hairBehind') {
      folderPath = 'hair/behind';
    } else if (partKey === 'body') {
      folderPath = 'body/body';
    } else if (partKey === 'clothes') {
      folderPath = 'body/clothes';
    } else if (partKey === 'eyes' || partKey === 'eyebrows' || partKey === 'mouth' || partKey === 'blush') {
      folderPath = `face/${partKey}`;
    } else if (partKey === 'glasses' || partKey === 'earring') {
      folderPath = `accessories/${partKey}`;
    } else {
      folderPath = partKey;
    }
    
    // For each asset in this part, check the standard path
    for (const assetId of assets) {
      // Skip "none" assets
      if (assetId === 'none') continue;
      
      // Standard asset path
      testPaths.push({
        partKey,
        assetId,
        path: `${BASE_PATH}/${folderPath}/${assetId}.png`,
        type: 'standard'
      });
      
      // Add color variants if this part supports them
      if (colorVariants[partKey]) {
        for (const color of colorVariants[partKey]) {
          const colorVariantId = `${assetId}-${color}`;
          testPaths.push({
            partKey,
            assetId: colorVariantId,
            path: `${BASE_PATH}/${folderPath}/${colorVariantId}.png`,
            type: 'color-variant'
          });
        }
      }
    }
  }
  
  return testPaths;
}

// Test all paths
async function testAllPaths() {
  console.log('🔍 Verifying asset paths...\n');
  
  // Check if the server is running
  const isServerRunning = await checkServerRunning();
  if (!isServerRunning) {
    console.error('❌ Development server is not running. Please start your Next.js server with "npm run dev" first.');
    return;
  }
  
  // Generate test paths
  const testPaths = await generateTestPaths();
  console.log(`✅ Generated ${testPaths.length} test paths`);
  
  // Group by part for nicer output
  const pathsByPart = {};
  for (const test of testPaths) {
    if (!pathsByPart[test.partKey]) {
      pathsByPart[test.partKey] = [];
    }
    pathsByPart[test.partKey].push(test);
  }
  
  // Results counters
  let totalPaths = 0;
  let existingPaths = 0;
  let missingPaths = 0;
  
  // Test each path
  console.log('\n📋 Path Verification Results:');
  
  for (const [partKey, tests] of Object.entries(pathsByPart)) {
    console.log(`\n${partKey}:`);
    
    for (const test of tests) {
      totalPaths++;
      const result = await checkPathExists(test.path);
      
      if (result.exists) {
        existingPaths++;
        console.log(`  ✅ ${test.assetId}: ${test.path}`);
      } else {
        missingPaths++;
        console.log(`  ❌ ${test.assetId}: ${test.path} (${result.statusCode})`);
      }
    }
  }
  
  // Summary
  console.log(`\n📊 Summary: ${existingPaths}/${totalPaths} paths exist (${missingPaths} missing)`);
  
  if (missingPaths > 0) {
    console.log('\n⚠️ Some assets are missing. You may need to:');
    console.log('  1. Create the missing assets');
    console.log('  2. Update the asset path resolver to use fallbacks');
    console.log('  3. Ensure the asset manifest is up to date');
  } else {
    console.log('\n✅ All assets verified successfully!');
  }
}

// Execute the script
testAllPaths().catch(console.error);
