#!/usr/bin/env node

/**
 * Asset Auto-Import Script
 * 
 * This script provides a convenient wrapper around asset management:
 * 1. Checks for asset changes (added or removed assets)
 * 2. Updates configuration
 * 3. Restarts the Next.js development server if needed
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 PixSelf Asset Auto-Import');
console.log('============================\n');

// Run the check-asset-changes script
try {
  console.log('Step 1: Checking for asset changes...\n');
  execSync('node scripts/check-asset-changes.js', { stdio: 'inherit' });
  
  console.log('\nStep 2: Would you like to restart the development server? (y/n)');
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        console.log('\nRestarting development server...');
        // Kill any running Next.js server
        execSync('pkill -f "next dev" || echo "No Next.js server running"');
        // Start the server in the background
        const child = require('child_process').spawn('npm', ['run', 'dev'], {
          detached: true,
          stdio: 'inherit'
        });
        
        // Detach the child process
        child.unref();
        
        console.log('\n✅ Development server restarted!');
        console.log('📝 Your assets should now be available in the application.');
      } catch (error) {
        console.error('\n❌ Error restarting development server:', error.message);
      }
    } else {
      console.log('\n✅ Asset check completed. No server restart performed.');
      console.log('📝 Remember to restart your development server manually to see the changes.');
    }
    
    rl.close();
  });
} catch (error) {
  console.error('\n❌ Error running asset check script:', error.message);
  rl.close();
  process.exit(1);
}
