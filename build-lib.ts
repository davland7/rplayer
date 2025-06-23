#!/usr/bin/env node

/**
 * Simple script to build only the RPlayer library (TypeScript version)
 * Focuses on generating the required files only
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Simplified build of RPlayer library v3.0.0 ===\n');

try {
  // Ensure lib directory exists
  const libDir = path.resolve(__dirname, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    console.log('Created lib directory\n');
  }

  // Use npm run to execute Vite build scripts
  // Build UMD version
  console.log('Building UMD module for CDN...');
  execSync('npm run build:lib:umd', { stdio: 'inherit' });
  console.log('UMD module built successfully\n');

  // Build ES version
  console.log('Building ES module...');
  execSync('npm run build:lib:es', { stdio: 'inherit' });
  console.log('ES module built successfully\n');

  // Check generated files
  console.log('Checking generated files:');
  const libFiles = fs.readdirSync(libDir);

  if (libFiles.length > 0) {
    console.log('Files in lib/:');
    libFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.error('No files found in lib/ directory');
    process.exit(1);
  }

  console.log('\nLibrary built successfully!');
} catch (error: any) {
  console.error('Build error:', error.message);
  process.exit(1);
}
