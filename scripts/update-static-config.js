#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '../public/assets/asset-manifest.json');
const CONFIG_PATH = path.join(__dirname, '../config/character-assets.ts');

// Part configurations
const partConfigs = {
  body: { label: "BODY", icon: "👤", category: "Body", defaultAsset: "default", optional: false },
  clothes: { label: "CLOTHES", icon: "👕", category: "Body", defaultAsset: "default", optional: true },
  hairBehind: { label: "HAIR BEHIND", icon: "🎭", category: "Hair", defaultAsset: "default", optional: true },
  hairFront: { label: "HAIR FRONT", icon: "💇", category: "Hair", defaultAsset: "default", optional: true },
  eyes: { label: "EYES", icon: "👀", category: "Face", defaultAsset: "default", optional: true },
  eyebrows: { label: "EYEBROWS", icon: "🤨", category: "Face", defaultAsset: "default", optional: true },
  mouth: { label: "MOUTH", icon: "👄", category: "Face", defaultAsset: "default", optional: true },
  blush: { label: "BLUSH", icon: "😊", category: "Face", defaultAsset: "none", optional: true },
  earring: { label: "EARRING", icon: "💎", category: "Accessories", defaultAsset: "none", optional: true },
  glasses: { label: "GLASSES", icon: "🤓", category: "Accessories", defaultAsset: "none", optional: true },
};

// Folder paths for each part
const folderPaths = {
  body: "body/body",
  clothes: "body/clothes", 
  hairBehind: "hair/hair-behind",
  hairFront: "hair/hair-front",
  eyes: "face/eyes",
  eyebrows: "face/eyebrows",
  mouth: "face/mouth",
  blush: "face/blush",
  earring: "accessories/earring",
  glasses: "accessories/glasses",
};

function generateAssetId(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|svg)$/i, '')
    .replace(/^[^-]+-/, '');
}

function generateAssetName(filename, partLabel) {
  const id = generateAssetId(filename);
  if (id === 'default') {
    return `Default ${partLabel}`;
  }
  
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + ` ${partLabel}`;
}

function generatePartDefinition(partKey, config, assets) {
  const assetsList = [];
  
  // Add "none" option for optional parts
  if (config.optional) {
    assetsList.push({
      id: "none",
      name: `No ${config.label}`,
      path: "",
      enabled: true,
    });
  }
  
  // Add all assets from manifest
  for (const filename of assets) {
    const assetId = generateAssetId(filename);
    const assetName = generateAssetName(filename, config.label);
    const assetPath = `/assets/character/${folderPaths[partKey]}/${filename}`;
    
    assetsList.push({
      id: assetId,
      name: assetName,
      path: assetPath,
      enabled: true,
    });
  }
  
  return {
    key: partKey,
    label: config.label,
    icon: config.icon,
    category: config.category,
    assets: assetsList,
    defaultAsset: config.defaultAsset,
    optional: config.optional,
  };
}

function updateStaticConfig() {
  try {
    // Read the manifest
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.log('❌ Manifest file not found. Run "npm run scan-assets" first.');
      return;
    }
    
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    console.log('✅ Manifest loaded:', Object.keys(manifest));
    
    // Generate parts from manifest
    const parts = [];
    for (const [partKey, config] of Object.entries(partConfigs)) {
      const assets = manifest[partKey] || [];
      const partDefinition = generatePartDefinition(partKey, config, assets);
      parts.push(partDefinition);
      console.log(`✅ Generated ${partKey}: ${assets.length} assets`);
    }
    
    // Read the current config file
    let configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    
    // Generate the new FALLBACK_CHARACTER_PARTS content
    const partsString = parts.map(part => {
      const assetsString = part.assets.map(asset => 
        `      {
        id: "${asset.id}",
        name: "${asset.name}",
        path: "${asset.path}",
        enabled: true,
      }`
      ).join(',\n');
      
      return `  {
    key: "${part.key}",
    label: "${part.label}",
    icon: "${part.icon}",
    category: "${part.category}",
    assets: [
${assetsString}
    ],
    defaultAsset: "${part.defaultAsset}",
    optional: ${part.optional},
  }`;
    }).join(',\n');
    
    // Replace the FALLBACK_CHARACTER_PARTS array using string manipulation
    const startMarker = 'const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [';
    const endMarker = '\n]';
    
    const startIndex = configContent.indexOf(startMarker);
    if (startIndex === -1) {
      console.log('❌ Could not find FALLBACK_CHARACTER_PARTS start marker');
      return;
    }
    
    const endIndex = configContent.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex === -1) {
      console.log('❌ Could not find FALLBACK_CHARACTER_PARTS end marker');
      return;
    }
    
    const newFallback = `const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [
${partsString}
];`;
    
    configContent = configContent.substring(0, startIndex) + newFallback + configContent.substring(endIndex + endMarker.length);
    
    // Write the updated config
    fs.writeFileSync(CONFIG_PATH, configContent, 'utf8');
    console.log('✅ Static config updated successfully!');
    console.log(`✅ Total parts: ${parts.length}`);
    console.log(`✅ Total assets: ${parts.reduce((sum, part) => sum + part.assets.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Error updating static config:', error);
  }
}

// Run the update
updateStaticConfig();
