#!/usr/bin/env node

/**
 * Script to verify assets naming and check if they will be properly recognized as color variants
 * Helps identify inconsistencies in naming patterns
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);

async function verifyAssets() {
  console.log('🔍 Verifying assets naming patterns...\n');
  
  const baseDir = path.join(process.cwd(), 'public/assets/character');
  
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
        const parentDir = path.relative(baseDir, dir);
        
        files.push({
          name: entry.name,
          path: relativePath,
          parentDir,
          fullPath
        });
      }
    }
    
    return files;
  }
  
  // Group files by their directories
  function groupFilesByPart(files) {
    const grouped = {};
    
    for (const file of files) {
      const dirPath = file.parentDir;
      if (!grouped[dirPath]) {
        grouped[dirPath] = [];
      }
      grouped[dirPath].push(file);
    }
    
    return grouped;
  }
  
  // Analyze naming patterns and detect color variants
  function analyzeNamingPatterns(groupedFiles) {
    const results = {};
    
    for (const [dirPath, files] of Object.entries(groupedFiles)) {
      // Skip empty directories
      if (files.length === 0) continue;
      
      const partAnalysis = {
        path: dirPath,
        baseAssets: [],
        colorVariants: {},
        inconsistencies: [],
        recommendations: []
      };
      
      // First pass: identify base assets and potential color variants
      for (const file of files) {
        const nameParts = file.name.replace('.png', '').split('-');
        
        // Detect if the filename includes a color at the end
        const hasColorVariant = nameParts.length >= 2 && 
          ['red', 'blue', 'green', 'pink', 'brown', 'black', 'blonde', 'purple'].includes(nameParts[nameParts.length - 1]);
        
        if (hasColorVariant) {
          // This is a color variant
          // Remove the color to get the base style
          const baseNameParts = [...nameParts];
          const color = baseNameParts.pop();
          const baseStyle = baseNameParts.join('-');
          const baseFileName = `${baseStyle}.png`;
          
          // Track this as a variant
          if (!partAnalysis.colorVariants[baseStyle]) {
            partAnalysis.colorVariants[baseStyle] = [];
          }
          partAnalysis.colorVariants[baseStyle].push({
            name: file.name,
            style: baseStyle,
            color
          });
        } else {
          // This is a base asset
          partAnalysis.baseAssets.push({
            name: file.name,
            style: nameParts.join('-')
          });
        }
      }
      
      // Second pass: check for inconsistencies
      
      // Check for base assets that have variants
      for (const [baseStyle, variants] of Object.entries(partAnalysis.colorVariants)) {
        const baseAssetExists = partAnalysis.baseAssets.some(asset => asset.style === baseStyle);
        
        if (!baseAssetExists) {
          partAnalysis.inconsistencies.push(`Found color variants for "${baseStyle}" but no base asset exists`);
        }
      }
      
      // Check for redundant part names in paths
      const dirParts = dirPath.split('/');
      if (dirParts.length >= 2) {
        const lastDirName = dirParts[dirParts.length - 1];
        
        // Check if filenames repeat the directory name
        let hasRedundantPrefix = false;
        const prefixToCheck = lastDirName + '-';
        
        for (const file of files) {
          if (file.name.startsWith(prefixToCheck)) {
            hasRedundantPrefix = true;
            break;
          }
        }
        
        if (hasRedundantPrefix) {
          partAnalysis.inconsistencies.push(`Path includes redundant part name "${lastDirName}"`);
          partAnalysis.recommendations.push(`Consider moving files to /${dirParts[0]}/${lastDirName}/ folder and rename to ${lastDirName.replace(/^[^-]+-/, '')}-[style].png`);
        }
      }
      
      results[dirPath] = partAnalysis;
    }
    
    return results;
  }

  try {
    // Scan all assets
    const allFiles = await scanDirectory(baseDir);
    
    // Group by directory
    const groupedFiles = groupFilesByPart(allFiles);
    
    // Analyze naming patterns
    const analysisResults = analyzeNamingPatterns(groupedFiles);
    
    // Output results
    for (const [dirPath, analysis] of Object.entries(analysisResults)) {
      console.log(`Asset structure for part: ${dirPath}`);
      
      // List base assets
      for (const asset of analysis.baseAssets) {
        console.log(`- ${asset.name} (base asset)`);
      }
      
      // List color variants
      for (const [baseStyle, variants] of Object.entries(analysis.colorVariants)) {
        for (const variant of variants) {
          console.log(`- ${variant.name} (color variant of "${baseStyle.split('-').pop()}")`);
        }
      }
      
      // Report inconsistencies
      for (const inconsistency of analysis.inconsistencies) {
        console.log(`⚠️ ${inconsistency}`);
      }
      
      // Show recommendations
      for (const recommendation of analysis.recommendations) {
        console.log(`Recommendation: ${recommendation}`);
      }
      
      // Show pattern status
      const totalAssets = analysis.baseAssets.length + Object.values(analysis.colorVariants).flat().length;
      const totalVariants = Object.values(analysis.colorVariants).flat().length;
      
      if (totalVariants === 0) {
        console.log('✅ No color variants found in this path');
      } else if (analysis.inconsistencies.length === 0) {
        console.log('✅ Correctly follows [part]-[style]-[color].png pattern');
      } else {
        console.log(`✅ All but ${analysis.inconsistencies.length} follow [part]-[style]-[color].png pattern`);
      }
      
      console.log('');
    }
    
    // Show overall recommendations
    console.log('💡 RECOMMENDATIONS FOR CONSISTENT NAMING:\n');
    
    console.log('1. For asset files:');
    console.log('   Use the pattern: [part]-[style]-[color].png');
    console.log('   Examples:');
    console.log('   - mouth-smile.png (base asset)');
    console.log('   - mouth-smile-pink.png (color variant)');
    console.log('   - eyes-default.png (base asset)');
    console.log('   - eyes-default-blue.png (color variant)');
    
    console.log('\n2. For folder structure:');
    console.log('   Option A - Current structure with short filenames:');
    console.log('   - /assets/character/hair/front/front-tomboy.png');
    console.log('   - /assets/character/hair/front/front-tomboy-brown.png');
    
    console.log('\n   Option B - Flatter structure with descriptive filenames:');
    console.log('   - /assets/character/hair-front-tomboy.png');
    console.log('   - /assets/character/hair-front-tomboy-brown.png');
    
    console.log('\n3. For asset IDs in code:');
    console.log('   Use the pattern: [style] or [style]-[color]');
    console.log('   Examples:');
    console.log('   - "smile" (base asset ID)');
    console.log('   - "smile-pink" (color variant ID)');
    console.log('   - "tomboy" (base asset ID)');
    console.log('   - "tomboy-brown" (color variant ID)');
    
    console.log('\n✨ Analysis complete!');
    
  } catch (err) {
    console.error('❌ Error analyzing assets:', err);
  }
}

// Execute the script
verifyAssets().catch(console.error);
