#!/usr/bin/env node

// Cache clearing utility for development
console.log('🧹 Clearing all caches...');

// Clear npm cache
const { execSync } = require('child_process');

try {
  console.log('1. Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  console.log('2. Removing node_modules...');
  execSync('rm -rf node_modules', { stdio: 'inherit' });
  
  console.log('3. Removing build cache...');
  execSync('rm -rf build', { stdio: 'inherit' });
  execSync('rm -rf .cache', { stdio: 'inherit' });
  
  console.log('4. Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Cache cleared! Please also:');
  console.log('   • Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)');
  console.log('   • Clear browser cache');
  console.log('   • Use incognito mode for testing');
  
} catch (error) {
  console.error('❌ Cache clearing failed:', error.message);
}