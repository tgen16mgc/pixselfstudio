#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting complete asset update with CDN setup...\n');

try {
  // Step 1: Run scan-assets
  console.log('📁 Step 1: Scanning asset folders...');
  execSync('npm run scan-assets', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Run update-config
  console.log('⚙️  Step 2: Updating static configuration...');
  execSync('npm run update-config', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 3: Run setup-cdn
  console.log('🌐 Step 3: Setting up GitHub CDN...');
  execSync('npm run setup-cdn', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Complete asset update with CDN setup completed successfully!');
  console.log('🎮 New assets are now available in the application.');
  console.log('🌐 All assets are served through GitHub CDN.');
  console.log('🔄 Restart the development server to see changes.');
  console.log('📤 Push to GitHub to make CDN URLs accessible.');
  
} catch (error) {
  console.error('\n❌ Error during complete asset update:', error.message);
  process.exit(1);
}
