#!/usr/bin/env node

/**
 * Script to create missing default assets
 * This will copy existing assets as defaults where needed
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Define paths that need default assets
const neededDefaults = [
  {
    part: 'hair-behind',
    sourcePath: 'hair/hair-behind/hair-behind-2side.png',
    targetPath: 'hair/hair-behind/hair-behind-default.png'
  },
  {
    part: 'hair-front',
    sourcePath: 'hair/hair-front/hair-front-tomboy.png',
    targetPath: 'hair/hair-front/hair-front-default.png'
  },
  {
    part: 'clothes',
    sourcePath: 'body/clothes/clothes-somi.png',
    targetPath: 'body/clothes/clothes-default.png'
  },
  // Add default paths for organized structure
  {
    part: 'hair-behind',
    sourcePath: 'hair/behind/2side.png',
    targetPath: 'hair/behind/default.png'
  },
  {
    part: 'hair-front',
    sourcePath: 'hair/front/tomboy.png',
    targetPath: 'hair/front/default.png'
  },
  {
    part: 'clothes',
    sourcePath: 'body/clothes/somi.png',
    targetPath: 'body/clothes/default.png'
  }
];

async function createDefaultAssets() {
  const baseDir = path.join(process.cwd(), 'public/assets/character');
  
  console.log('🔧 Creating default assets...');
  
  for (const def of neededDefaults) {
    const sourcePath = path.join(baseDir, def.sourcePath);
    const targetPath = path.join(baseDir, def.targetPath);
    
    try {
      // Check if source exists
      if (await exists(sourcePath)) {
        // Create directories if needed
        const targetDir = path.dirname(targetPath);
        if (!(await exists(targetDir))) {
          await mkdir(targetDir, { recursive: true });
        }
        
        // Copy the file
        await copyFile(sourcePath, targetPath);
        console.log(`✅ Created default for ${def.part}: ${def.targetPath}`);
      } else {
        console.log(`⚠️ Source file not found for ${def.part}: ${def.sourcePath}`);
      }
    } catch (err) {
      console.error(`❌ Failed to create default for ${def.part}:`, err.message);
    }
  }
  
  console.log('✅ Default assets creation complete!');
}

// Run the script
createDefaultAssets().catch(console.error);
