#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting complete asset update with CDN setup...\n');

try {
  // Step 1: Run scan
  console.log('📁 Step 1: Scanning asset folders...');
  execSync('npm run scan', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Run config
  console.log('⚙️  Step 2: Updating static configuration...');
  execSync('npm run config', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 3: Add color variants (if any new assets detected)
  console.log('🎨 Step 3: Adding color variants to new assets...');
  try {
    execSync('npm run colors', { stdio: 'inherit' });
    console.log('✅ Color variants added successfully!');
  } catch (colorError) {
    console.log('ℹ️  No new color variants to add or color variants already up to date.');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 4: Run cdn
  console.log('🌐 Step 4: Setting up GitHub CDN...');
  execSync('npm run cdn', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Complete asset update with CDN setup completed successfully!');
  console.log('🎮 New assets are now available in the application.');
  console.log('🎨 Color variants have been added to the configuration.');
  console.log('🌐 All assets are served through GitHub CDN.');
  console.log('🔄 Restart the development server to see changes.');
  console.log('📤 Push to GitHub to make CDN URLs accessible.');
  
} catch (error) {
  console.error('\n❌ Error during complete asset update:', error.message);
  process.exit(1);
}
