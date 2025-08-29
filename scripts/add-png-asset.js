#!/usr/bin/env node

/**
 * PixSelf PNG Asset Manager
 * 
 * This script handles the complete workflow for adding PNG assets:
 * 1. Base style assets → Updates hardcoded config (character-assets.ts)
 * 2. Color variant assets → Updates dynamic manifest (color-variants-manifest.json)
 * 3. Handles the dual system architecture properly
 * 
 * Usage:
 *   node scripts/add-png-asset.js --file path/to/asset.png --part hairFront --style newstyle
 *   node scripts/add-png-asset.js --file path/to/asset.png --part hairFront --style tomboy --color blue
 *   node scripts/add-png-asset.js --scan  # Auto-detect and process all new assets
 *   node scripts/add-png-asset.js --remove --part hairFront --style oldstyle  # Remove style and all variants
 *   node scripts/add-png-asset.js --remove --part hairFront --style tomboy --color blue  # Remove specific variant
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'character');
const CONFIG_FILE = path.join(__dirname, '..', 'config', 'character-assets.ts');
const MANIFEST_FILE = path.join(__dirname, '..', 'public', 'assets', 'color-variants-manifest.json');

// Part configuration mapping
const PART_CONFIG = {
  body: { 
    folder: 'body/body', 
    prefix: 'body',
    category: 'Body',
    label: 'BODY',
    icon: '👤'
  },
  clothes: { 
    folder: 'body/clothes', 
    prefix: 'clothes',
    category: 'Body',
    label: 'CLOTHES',
    icon: '👕'
  },
  hairFront: { 
    folder: 'hair/hair-front', 
    prefix: 'hair-front',
    category: 'Hair',
    label: 'HAIR FRONT',
    icon: '💇'
  },
  hairBehind: { 
    folder: 'hair/hair-behind', 
    prefix: 'hair-behind',
    category: 'Hair',
    label: 'HAIR BEHIND',
    icon: '🎭'
  },
  eyes: { 
    folder: 'face/eyes', 
    prefix: 'eyes',
    category: 'Face',
    label: 'EYES',
    icon: '👀'
  },
  eyebrows: { 
    folder: 'face/eyebrows', 
    prefix: 'eyebrows',
    category: 'Face',
    label: 'EYEBROWS',
    icon: '🤨'
  },
  mouth: { 
    folder: 'face/mouth', 
    prefix: 'mouth',
    category: 'Face',
    label: 'MOUTH',
    icon: '👄'
  },
  blush: { 
    folder: 'face/blush', 
    prefix: 'blush',
    category: 'Face',
    label: 'BLUSH',
    icon: '😊'
  },
  earring: { 
    folder: 'accessories/earring', 
    prefix: 'earring',
    category: 'Accessories',
    label: 'EARRING',
    icon: '💎'
  },
  glasses: { 
    folder: 'accessories/glasses', 
    prefix: 'glasses',
    category: 'Accessories',
    label: 'GLASSES',
    icon: '🤓'
  },
  hat: { 
    folder: 'accessories/hat', 
    prefix: 'hat',
    category: 'Accessories',
    label: 'HAT',
    icon: '🎩'
  }
};

// Color configuration
const COLOR_MAPPING = {
  black: '#333333',
  brown: '#8B4513',
  choco: '#D2691E',
  blonde: '#DAA520',
  red: '#FF8A80',
  purple: '#CE93D8',
  blue: '#90CAF9',
  pink: '#F8BBD0',
  white: '#FFFFFF',
  yellow: '#FFF59D',
  green: '#4ECDC4',
  orange: '#FFB74D',
  gray: '#9E9E9E',
  gold: '#FFD700',
  silver: '#C0C0C0'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--file':
        options.file = value;
        break;
      case '--part':
        options.part = value;
        break;
      case '--style':
        options.style = value;
        break;
      case '--color':
        options.color = value;
        break;
      case '--scan':
        options.scan = true;
        i--; // No value for --scan flag
        break;
      case '--remove':
        options.remove = true;
        i--; // No value for --remove flag
        break;
      case '--help':
        options.help = true;
        i--; // No value for --help flag
        break;
      default:
        console.warn(`⚠️  Unknown flag: ${flag}`);
        i--; // Don't skip next argument
    }
  }
  
  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🎨 PixSelf PNG Asset Manager

USAGE:
  node scripts/add-png-asset.js [OPTIONS]

OPTIONS:
  --file PATH     Path to the PNG file to add
  --part PART     Part type (hairFront, eyes, mouth, etc.)
  --style STYLE   Style name (tomboy, smile, default, etc.)
  --color COLOR   Color variant (optional - black, brown, blonde, etc.)
  --scan          Auto-detect and process all new PNG files
  --remove        Remove assets instead of adding them
  --help          Show this help

EXAMPLES:
  # Add a new hairstyle
  node scripts/add-png-asset.js --file /path/to/pixie.png --part hairFront --style pixie

  # Add a color variant for existing style
  node scripts/add-png-asset.js --file /path/to/tomboy-purple.png --part hairFront --style tomboy --color purple

  # Auto-detect all new assets
  node scripts/add-png-asset.js --scan

  # Remove a style and all its color variants
  node scripts/add-png-asset.js --remove --part hairFront --style pixie

  # Remove specific color variant only
  node scripts/add-png-asset.js --remove --part hairFront --style tomboy --color purple

SUPPORTED PARTS:
  ${Object.keys(PART_CONFIG).join(', ')}

SUPPORTED COLORS:
  ${Object.keys(COLOR_MAPPING).join(', ')}
`);
}

/**
 * Analyze filename to extract part, style, and color information
 */
function analyzeFilename(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.png$/i, '');
  
  // Try to match pattern: {prefix}-{style}(-{color})?
  for (const [partKey, config] of Object.entries(PART_CONFIG)) {
    const prefix = config.prefix;
    
    if (nameWithoutExt.startsWith(prefix + '-')) {
      const remainder = nameWithoutExt.substring(prefix.length + 1);
      
      // Check if it has a color suffix
      for (const color of Object.keys(COLOR_MAPPING)) {
        if (remainder.endsWith('-' + color)) {
          const style = remainder.substring(0, remainder.length - color.length - 1);
          return { part: partKey, style, color };
        }
      }
      
      // No color suffix, it's a base style
      return { part: partKey, style: remainder, color: null };
    }
  }
  
  return null;
}

/**
 * Copy file to the correct location
 */
function copyAssetFile(sourceFile, part, style, color = null) {
  const partConfig = PART_CONFIG[part];
  if (!partConfig) {
    throw new Error(`Unknown part: ${part}`);
  }
  
  const targetDir = path.join(ASSETS_DIR, partConfig.folder);
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Generate target filename
  const colorSuffix = color ? `-${color}` : '';
  const targetFilename = `${partConfig.prefix}-${style}${colorSuffix}.png`;
  const targetPath = path.join(targetDir, targetFilename);
  
  // Copy file
  fs.copyFileSync(sourceFile, targetPath);
  console.log(`📁 Copied to: ${path.relative(process.cwd(), targetPath)}`);
  
  return targetPath;
}

/**
 * Remove asset file
 */
function removeAssetFile(part, style, color = null) {
  const partConfig = PART_CONFIG[part];
  if (!partConfig) {
    throw new Error(`Unknown part: ${part}`);
  }
  
  const targetDir = path.join(ASSETS_DIR, partConfig.folder);
  
  // Generate target filename
  const colorSuffix = color ? `-${color}` : '';
  const targetFilename = `${partConfig.prefix}-${style}${colorSuffix}.png`;
  const targetPath = path.join(targetDir, targetFilename);
  
  // Check if file exists
  if (!fs.existsSync(targetPath)) {
    console.log(`ℹ️  File not found: ${path.relative(process.cwd(), targetPath)}`);
    return false;
  }
  
  // Remove file
  fs.unlinkSync(targetPath);
  console.log(`🗑️  Removed: ${path.relative(process.cwd(), targetPath)}`);
  
  return true;
}

/**
 * Remove all color variants for a style
 */
function removeAllColorVariants(part, style) {
  const partConfig = PART_CONFIG[part];
  const targetDir = path.join(ASSETS_DIR, partConfig.folder);
  
  if (!fs.existsSync(targetDir)) {
    return 0;
  }
  
  let removedCount = 0;
  const files = fs.readdirSync(targetDir);
  const prefix = `${partConfig.prefix}-${style}-`;
  
  for (const file of files) {
    if (file.startsWith(prefix) && file.endsWith('.png')) {
      const filePath = path.join(targetDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed color variant: ${path.relative(process.cwd(), filePath)}`);
      removedCount++;
    }
  }
  
  return removedCount;
}

/**
 * Add base style to hardcoded config
 */
function addStyleToConfig(part, style) {
  const partConfig = PART_CONFIG[part];
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  
  // Generate the new asset entry
  const assetId = style;
  const assetName = `${style.charAt(0).toUpperCase() + style.slice(1)} ${partConfig.label}`;
  const assetPath = `https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/${partConfig.folder}/${partConfig.prefix}-${style}.png`;
  
  const newAssetEntry = `    {
      id: "${assetId}",
      name: "${assetName}",
      path: "${assetPath}",
      enabled: true,
    }`;
  
  // Find the part section and add the new asset
  const partKeyPattern = new RegExp(`(key: "${part}"[\\s\\S]*?assets: \\[[\\s\\S]*?)(\\s+\\])`);
  const match = configContent.match(partKeyPattern);
  
  if (!match) {
    throw new Error(`Could not find part section for ${part} in config file`);
  }
  
  // Check if asset already exists
  if (configContent.includes(`id: "${assetId}"`)) {
    console.log(`ℹ️  Style "${style}" already exists in config for ${part}`);
    return false;
  }
  
  // Insert the new asset before the closing bracket
  const updatedContent = configContent.replace(
    partKeyPattern,
    `$1,
${newAssetEntry}$2`
  );
  
  fs.writeFileSync(CONFIG_FILE, updatedContent);
  console.log(`✅ Added style "${style}" to config for ${part}`);
  return true;
}

/**
 * Remove base style from hardcoded config
 */
function removeStyleFromConfig(part, style) {
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  
  // Find and remove the asset entry
  const assetId = style;
  
  // Pattern to match the entire asset block
  const assetPattern = new RegExp(
    `\\s*{\\s*id:\\s*"${assetId}"[\\s\\S]*?enabled:\\s*true,?\\s*},?`, 
    'g'
  );
  
  const match = configContent.match(assetPattern);
  if (!match) {
    console.log(`ℹ️  Style "${style}" not found in config for ${part}`);
    return false;
  }
  
  // Remove the asset entry
  const updatedContent = configContent.replace(assetPattern, '');
  
  // Clean up any double commas or trailing commas before closing brackets
  const cleanedContent = updatedContent
    .replace(/,\s*,/g, ',')  // Remove double commas
    .replace(/,(\s*\])/g, '$1');  // Remove trailing commas before ]
  
  fs.writeFileSync(CONFIG_FILE, cleanedContent);
  console.log(`🗑️  Removed style "${style}" from config for ${part}`);
  return true;
}

/**
 * Process a single asset file
 */
async function processAssetFile(filePath, part, style, color = null) {
  console.log(`\n🎨 Processing: ${path.basename(filePath)}`);
  console.log(`   Part: ${part}`);
  console.log(`   Style: ${style}`);
  console.log(`   Color: ${color || 'none (base style)'}`);
  
  // Copy file to correct location
  const targetPath = copyAssetFile(filePath, part, style, color);
  
  // If it's a base style (no color), add to hardcoded config
  if (!color) {
    addStyleToConfig(part, style);
  }
  
  console.log(`✅ Processed successfully`);
}

/**
 * Remove a single asset (main function)
 */
async function removeAsset(part, style, color = null) {
  console.log(`\n🗑️  Removing: ${part}/${style}${color ? `-${color}` : ''}`);
  console.log(`   Part: ${part}`);
  console.log(`   Style: ${style}`);
  console.log(`   Color: ${color || 'none (will remove base style + all variants)'}`);
  
  if (color) {
    // Remove specific color variant only
    const removed = removeAssetFile(part, style, color);
    if (removed) {
      console.log(`✅ Removed color variant successfully`);
    } else {
      console.log(`⚠️  Color variant not found`);
    }
  } else {
    // Remove base style and all color variants
    let removedCount = 0;
    
    // Remove base style file
    const baseRemoved = removeAssetFile(part, style);
    if (baseRemoved) removedCount++;
    
    // Remove all color variants
    const variantsRemoved = removeAllColorVariants(part, style);
    removedCount += variantsRemoved;
    
    // Remove from hardcoded config
    removeStyleFromConfig(part, style);
    
    if (removedCount > 0) {
      console.log(`✅ Removed ${removedCount} files (1 base style + ${variantsRemoved} color variants)`);
    } else {
      console.log(`⚠️  No files found to remove`);
    }
  }
}

/**
 * Scan for new PNG files and process them
 */
function scanAndProcessAssets() {
  console.log('🔍 Scanning for new PNG files...\n');
  
  const foundAssets = [];
  
  // Scan each part folder
  for (const [partKey, config] of Object.entries(PART_CONFIG)) {
    const partDir = path.join(ASSETS_DIR, config.folder);
    
    if (!fs.existsSync(partDir)) {
      console.log(`⚠️  Directory not found: ${partDir}`);
      continue;
    }
    
    const files = fs.readdirSync(partDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
      const analysis = analyzeFilename(file);
      if (analysis) {
        foundAssets.push({
          file: path.join(partDir, file),
          ...analysis
        });
      }
    }
  }
  
  console.log(`📊 Found ${foundAssets.length} assets to analyze\n`);
  
  // Group by base styles
  const baseStyles = new Map();
  const colorVariants = [];
  
  for (const asset of foundAssets) {
    if (asset.color) {
      colorVariants.push(asset);
    } else {
      const key = `${asset.part}-${asset.style}`;
      baseStyles.set(key, asset);
    }
  }
  
  console.log(`📋 Summary:`);
  console.log(`   Base styles: ${baseStyles.size}`);
  console.log(`   Color variants: ${colorVariants.length}`);
  
  return { baseStyles: Array.from(baseStyles.values()), colorVariants };
}

/**
 * Update color variants manifest
 */
async function updateColorVariantsManifest() {
  console.log('\n🎨 Updating color variants manifest...');
  
  try {
    // Run both asset manifest and color variants manifest updates
    const { execSync } = require('child_process');
    
    // First update the asset manifest
    execSync('npm run scan', { stdio: 'inherit' });
    
    // Then update the color variants manifest specifically
    execSync('node scripts/create-test-assets.js', { stdio: 'inherit' });
    
    console.log('✅ Color variants manifest updated');
  } catch (error) {
    console.error('❌ Failed to update color variants manifest:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  console.log('🎨 PixSelf PNG Asset Manager\n');
  
  try {
    if (options.scan) {
      // Auto-scan mode
      const { baseStyles, colorVariants } = scanAndProcessAssets();
      
      // Update the manifest to handle any new color variants
      await updateColorVariantsManifest();
      
      console.log('\n🎉 Scan complete!');
      console.log('   Run `npm run dev` to see changes');
      
    } else if (options.remove) {
      // Remove mode
      if (!options.part || !options.style) {
        console.error('❌ --part and --style are required when using --remove');
        process.exit(1);
      }
      
      if (!PART_CONFIG[options.part]) {
        console.error(`❌ Unknown part: ${options.part}`);
        console.log(`   Supported parts: ${Object.keys(PART_CONFIG).join(', ')}`);
        process.exit(1);
      }
      
      if (options.color && !COLOR_MAPPING[options.color]) {
        console.error(`❌ Unknown color: ${options.color}`);
        console.log(`   Supported colors: ${Object.keys(COLOR_MAPPING).join(', ')}`);
        process.exit(1);
      }
      
      await removeAsset(options.part, options.style, options.color);
      
      // Update manifest after removal
      await updateColorVariantsManifest();
      
      console.log('\n🎉 Asset removed successfully!');
      console.log('   Run `npm run dev` to see changes');
      
    } else if (options.file) {
      // Manual file processing mode
      if (!options.part || !options.style) {
        console.error('❌ --part and --style are required when using --file');
        process.exit(1);
      }
      
      if (!fs.existsSync(options.file)) {
        console.error(`❌ File not found: ${options.file}`);
        process.exit(1);
      }
      
      if (!PART_CONFIG[options.part]) {
        console.error(`❌ Unknown part: ${options.part}`);
        console.log(`   Supported parts: ${Object.keys(PART_CONFIG).join(', ')}`);
        process.exit(1);
      }
      
      if (options.color && !COLOR_MAPPING[options.color]) {
        console.error(`❌ Unknown color: ${options.color}`);
        console.log(`   Supported colors: ${Object.keys(COLOR_MAPPING).join(', ')}`);
        process.exit(1);
      }
      
      await processAssetFile(options.file, options.part, options.style, options.color);
      
      // Update manifest if needed
      await updateColorVariantsManifest();
      
      console.log('\n🎉 Asset added successfully!');
      console.log('   Run `npm run dev` to see changes');
      
    } else {
      console.error('❌ Either --file, --scan, or --remove must be specified');
      showHelp();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  processAssetFile,
  scanAndProcessAssets,
  analyzeFilename,
  PART_CONFIG,
  COLOR_MAPPING
};
