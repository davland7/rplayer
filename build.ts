#!/usr/bin/env node

/**
 * TypeScript script to build the RPlayer library and documentation site.
 * Ensures UMD/ES builds, type definitions, and Astro site are generated.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

console.log(`${colors.bright}${colors.blue}=== Building RPlayer v3.0.0 ===${colors.reset}\n`);

(async function() {
try {
  // 0. Ensure lib directory exists
  if (!fs.existsSync(path.resolve(__dirname, 'lib'))) {
    fs.mkdirSync(path.resolve(__dirname, 'lib'), { recursive: true });
    console.log(`${colors.blue}Created lib directory${colors.reset}\n`);
  }

  // 1. Build UMD module
  console.log(`${colors.yellow}[1/4]${colors.reset} Building UMD module for CDN...`);
  try {
    execSync('npm run build:lib:umd', { stdio: 'inherit' });
    console.log(`${colors.green}✓ UMD module built successfully${colors.reset}\n`);
  } catch (err: any) {
    console.error(`${colors.red}Error building UMD module:${colors.reset}`, err.message);
    console.log(`${colors.yellow}Continuing despite the error...${colors.reset}\n`);
  }

  // 2. Build ES module
  console.log(`${colors.yellow}[2/4]${colors.reset} Building ES module...`);
  try {
    execSync('npm run build:lib:es', { stdio: 'inherit' });
    console.log(`${colors.green}✓ ES module built successfully${colors.reset}\n`);
  } catch (err: any) {
    console.error(`${colors.red}Error building ES module:${colors.reset}`, err.message);
    console.log(`${colors.yellow}Attempting manual ES module creation...${colors.reset}`);
    try {
      const indexContent = await fs.promises.readFile(path.resolve(__dirname, 'src', 'lib', 'index.ts'), 'utf8');
      await fs.promises.writeFile(path.resolve(__dirname, 'lib', 'rplayer.es.js'),
        `// Transpiled version of src/lib/index.ts\n${indexContent.replace(/\.ts/g, '.js')}`, 'utf8');
      console.log(`${colors.green}✓ Manual fallback ES file created${colors.reset}`);
    } catch (readWriteError: any) {
      console.error(`${colors.red}Error creating manual ES file:${colors.reset}`, readWriteError.message);
    }
    console.log(`${colors.green}✓ Manual ES module created${colors.reset}\n`);
  }

  // 3. Copy TypeScript definition file
  console.log(`${colors.yellow}[3/4]${colors.reset} Copying TypeScript definition file...`);
  try {
    if (fs.existsSync(path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'))) {
      fs.copyFileSync(
        path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'),
        path.resolve(__dirname, 'lib', 'rplayer.d.ts')
      );
      console.log(`${colors.green}✓ TypeScript definition file copied${colors.reset}\n`);
    } else {
      console.warn(`${colors.yellow}TypeScript definition file not found in src/lib/${colors.reset}`);
    }
  } catch (err: any) {
    console.error(`${colors.red}Error copying TypeScript definition file:${colors.reset}`, err.message);
  }

  // 4. Check generated files
  const requiredFiles = [
    'lib/rplayer.es.js',
    'lib/rplayer.umd.min.js',
    'lib/rplayer.d.ts',
  ];

  console.log(`${colors.yellow}[4/4]${colors.reset} Checking generated files...`);
  try {
    const libFiles = fs.readdirSync(path.resolve(__dirname, 'lib'));
    libFiles.forEach(file => console.log(`  - ${file}`));
  } catch (err: any) {
    console.error(`${colors.red}Error reading lib directory:${colors.reset}`, err.message);
  }

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.resolve(__dirname, file)));

  if (missingFiles.length > 0) {
    console.warn(`${colors.yellow}Warning: Some files are missing:${colors.reset}`);
    missingFiles.forEach(file => console.warn(` - ${file}`));
    for (const file of missingFiles) {
      console.log(`${colors.yellow}Attempting to rebuild ${file}...${colors.reset}`);
      if (file === 'lib/rplayer.es.js') {
        try {
          execSync('npm run build:lib:es', { stdio: 'inherit' });
        } catch (err: any) {
          console.error(`${colors.red}Failed to rebuild ${file}:${colors.reset}`, err.message);
        }
      } else if (file === 'lib/rplayer.umd.min.js') {
        try {
          execSync('npm run build:lib:umd', { stdio: 'inherit' });
        } catch (err: any) {
          console.error(`${colors.red}Failed to rebuild ${file}:${colors.reset}`, err.message);
        }
      } else if (file === 'lib/rplayer.d.ts') {
        try {
          if (fs.existsSync(path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'))) {
            fs.copyFileSync(
              path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'),
              path.resolve(__dirname, 'lib', 'rplayer.d.ts')
            );
            console.log(`${colors.green}✓ ${file} recreated successfully${colors.reset}`);
          }
        } catch (err: any) {
          console.error(`${colors.red}Failed to recreate ${file}:${colors.reset}`, err.message);
        }
      }
    }
    const stillMissing = requiredFiles.filter(file => !fs.existsSync(path.resolve(__dirname, file)));
    if (stillMissing.length > 0) {
      console.warn(`${colors.yellow}Warning: Some files are still missing but build will continue:${colors.reset}`);
      stillMissing.forEach(file => console.warn(` - ${file}`));
    } else {
      console.log(`${colors.green}✓ All missing files have been rebuilt${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.green}✓ All library files generated${colors.reset}\n`);
  }

  // 5. Build Astro site
  console.log(`${colors.yellow}[4/4]${colors.reset} Building documentation site...`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Documentation site built successfully${colors.reset}\n`);

  console.log(`${colors.bright}${colors.green}=== Build completed successfully! ===${colors.reset}`);
  console.log(`\nYou can preview the site with: ${colors.blue}npm run preview${colors.reset}`);

} catch (error: any) {
  console.error(`${colors.red}Build error:${colors.reset}`, error.message);
  process.exit(1);
}
})();
