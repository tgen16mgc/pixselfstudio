#!/usr/bin/env node

/**
 * Script to reorganize assets according to standardized naming conventions
 * This will create a proposed file structure but won't actually move files
 * unless the --apply flag is provided
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

// Configuration
const DRY_RUN = !process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');
const RECOMMENDED_STRUCTURE = 'option-a'; // option-a for cleaner structure, option-b for current structure

async function organizeAssets() {
  console.log('🔍 Analyzing assets for reorganization...\n');
  
  const baseDir = path.join(process.cwd(), 'public/assets/character');
  const outputDir = DRY_RUN ? null : path.join(process.cwd(), 'public/assets/character-organized');
  
  // Helper function to recursively scan directory
  async function scanDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await scanDirectory(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.png')) {
        // Get relative path from baseDir
        const relativePath = path.relative(baseDir, fullPath);
        files.push({
          name: entry.name,
          path: relativePath,
          fullPath
        });
      }
    }
    
    return files;
  }
  
  // Analyze asset paths and determine optimal organization
  function analyzeAssets(files) {
    // Map to track processed assets
    const processedAssets = [];
    
    for (const file of files) {
      const pathParts = file.path.split('/');
      const nameParts = file.name.replace('.png', '').split('-');
      
      // Extract part information
      let part = pathParts[0];
      let subpart = '';
      
      // Handle nested directories
      if (pathParts.length > 2) {
        // Cases like "hair/hair-front/hair-front-tomboy.png"
        part = pathParts[0];
        subpart = pathParts[1].replace(`${part}-`, '');
      }
      
      // Extract style and color from filename
      let style = '';
      let color = '';
      
      // Detect if last part is a color
      const knownColors = ['red', 'blue', 'green', 'pink', 'brown', 'black', 'blonde', 'purple'];
      const hasColorVariant = nameParts.length > 1 && knownColors.includes(nameParts[nameParts.length - 1]);
      
      if (hasColorVariant) {
        color = nameParts.pop();
        style = nameParts.join('-');
      } else {
        style = nameParts.join('-');
      }
      
      // Remove redundant prefixes in style name
      if (style.startsWith(`${part}-`)) {
        style = style.substring(part.length + 1);
      }
      
      if (subpart && style.startsWith(`${subpart}-`)) {
        style = style.substring(subpart.length + 1);
      }
      
      // Generate new paths based on recommended structure
      let newRelativePath = '';
      
      if (RECOMMENDED_STRUCTURE === 'option-a') {
        // Option A: Cleaner structure with shorter filenames
        // /assets/character/hair/front/tomboy.png
        // /assets/character/hair/front/tomboy-brown.png
        let newDir = '';
        let newFilename = '';
        
        if (subpart) {
          newDir = path.join(part, subpart);
          newFilename = `${style}${color ? '-' + color : ''}.png`;
        } else {
          newDir = part;
          newFilename = `${style}${color ? '-' + color : ''}.png`;
        }
        
        newRelativePath = path.join(newDir, newFilename);
      } else {
        // Option B: Current structure with consistent naming
        // /assets/character/hair-front-tomboy.png
        // /assets/character/hair-front-tomboy-brown.png
        const prefix = subpart ? `${part}-${subpart}` : part;
        newRelativePath = `${prefix}-${style}${color ? '-' + color : ''}.png`;
      }
      
      processedAssets.push({
        originalPath: file.path,
        fullPath: file.fullPath,
        part,
        subpart,
        style,
        color,
        newRelativePath
      });
    }
    
    return processedAssets;
  }
  
  // Copy files to new structure
  async function applyNewStructure(processedAssets) {
    if (DRY_RUN) {
      console.log('⚠️ DRY RUN - No files will be copied');
    } else {
      // Create output directory if it doesn't exist
      if (!(await exists(outputDir))) {
        await mkdir(outputDir, { recursive: true });
      }
    }
    
    for (const asset of processedAssets) {
      const destPath = path.join(outputDir, asset.newRelativePath);
      const destDir = path.dirname(destPath);
      
      if (!DRY_RUN) {
        // Create directory if it doesn't exist
        if (!(await exists(destDir))) {
          await mkdir(destDir, { recursive: true });
        }
        
        // Copy file
        try {
          await copyFile(asset.fullPath, destPath);
          console.log(`✅ Copied: ${asset.originalPath} -> ${asset.newRelativePath}`);
        } catch (err) {
          console.error(`❌ Failed to copy ${asset.originalPath}: ${err.message}`);
        }
      } else if (VERBOSE) {
        console.log(`${asset.originalPath} -> ${asset.newRelativePath}`);
      }
    }
  }
  
  // Generate asset ID mapping
  function generateAssetIdMapping(processedAssets) {
    const mapping = {};
    
    for (const asset of processedAssets) {
      const partKey = asset.subpart 
        ? `${asset.part}${asset.subpart.charAt(0).toUpperCase() + asset.subpart.slice(1)}`
        : asset.part;
      
      const oldAssetId = path.basename(asset.originalPath, '.png');
      
      // Calculate new asset ID
      let newAssetId = '';
      if (asset.color) {
        newAssetId = `${asset.style}-${asset.color}`;
      } else {
        newAssetId = asset.style;
      }
      
      if (!mapping[partKey]) {
        mapping[partKey] = {};
      }
      
      mapping[partKey][oldAssetId] = newAssetId;
    }
    
    return mapping;
  }

  try {
    // Scan all assets
    const allFiles = await scanDirectory(baseDir);
    console.log(`✅ Found ${allFiles.length} asset files`);
    
    // Analyze assets
    const processedAssets = analyzeAssets(allFiles);
    
    // Group by part
    const assetsByPart = {};
    for (const asset of processedAssets) {
      const partKey = asset.subpart ? `${asset.part}/${asset.subpart}` : asset.part;
      
      if (!assetsByPart[partKey]) {
        assetsByPart[partKey] = [];
      }
      
      assetsByPart[partKey].push(asset);
    }
    
    // Print proposed changes
    console.log('\n📋 Proposed Asset Organization:');
    
    for (const [partKey, assets] of Object.entries(assetsByPart)) {
      console.log(`\n${partKey}:`);
      
      // Group by style to show variants together
      const styleGroups = {};
      for (const asset of assets) {
        if (!styleGroups[asset.style]) {
          styleGroups[asset.style] = [];
        }
        styleGroups[asset.style].push(asset);
      }
      
      for (const [style, styleAssets] of Object.entries(styleGroups)) {
        console.log(`  ${style}:`);
        for (const asset of styleAssets) {
          console.log(`    ${asset.originalPath} -> ${asset.newRelativePath}${asset.color ? ` (${asset.color})` : ''}`);
        }
      }
    }
    
    // Generate asset ID mapping
    const assetIdMapping = generateAssetIdMapping(processedAssets);
    
    console.log('\n📝 Asset ID Mapping:');
    for (const [partKey, idMap] of Object.entries(assetIdMapping)) {
      console.log(`\n${partKey}:`);
      for (const [oldId, newId] of Object.entries(idMap)) {
        console.log(`  ${oldId} -> ${newId}`);
      }
    }
    
    // Apply changes if not in dry run mode
    if (!DRY_RUN) {
      console.log('\n🔄 Applying changes...');
      await applyNewStructure(processedAssets);
      console.log('✅ Asset organization complete!');
    } else {
      console.log('\n⚠️ This was a dry run. To apply these changes, run with the --apply flag');
    }
    
  } catch (err) {
    console.error('❌ Error organizing assets:', err);
  }
}

// Execute the script
organizeAssets().catch(console.error);
