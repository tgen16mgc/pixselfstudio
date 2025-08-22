#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting combined asset update process...\n');

try {
  // Step 1: Run scan-assets
  console.log('📁 Step 1: Scanning asset folders...');
  execSync('npm run scan-assets', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Run update-config
  console.log('⚙️  Step 2: Updating static configuration...');
  execSync('npm run update-config', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Combined asset update completed successfully!');
  console.log('🎮 New assets are now available in the application.');
  console.log('🔄 Restart the development server to see changes.');
  
} catch (error) {
  console.error('\n❌ Error during combined asset update:', error.message);
  process.exit(1);
}
