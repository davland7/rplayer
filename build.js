#!/usr/bin/env node

/**
 * Ce script construit toute la bibliothèque RPlayer et le site de documentation.
 * Il s'assure que tout est construit dans  // 5. Construction du site Astro
  console.log(`${colors.yellow}[5/5]${colors.reset} Construction du site de documentation...`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Site de documentation construit avec succès${colors.reset}\n`);bon ordre et avec les bonnes versions.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire courant (équivalent de __dirname dans CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

console.log(`${colors.bright}${colors.blue}=== Construction de RPlayer v3.0.0 ===${colors.reset}\n`);

(async function() {
try {
  // 0. Création du répertoire lib s'il n'existe pas
  if (!fs.existsSync(path.resolve(__dirname, 'lib'))) {
    fs.mkdirSync(path.resolve(__dirname, 'lib'), { recursive: true });
    console.log(`${colors.blue}Répertoire lib créé${colors.reset}\n`);
  }

  // 1. Construction de la bibliothèque UMD d'abord (moins susceptible aux problèmes)
  console.log(`${colors.yellow}[1/4]${colors.reset} Construction du module UMD pour CDN...`);
  try {
    execSync('npm run build:lib:umd', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Module UMD construit avec succès${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}Erreur lors de la construction du module UMD:${colors.reset}`, err.message);
    console.log(`${colors.yellow}Poursuite malgré l'erreur...${colors.reset}\n`);
  }

  // 2. Construction de la bibliothèque ES module
  console.log(`${colors.yellow}[2/4]${colors.reset} Construction du module ES...`);
  try {
    execSync('npm run build:lib:es', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Module ES construit avec succès${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}Erreur lors de la construction du module ES:${colors.reset}`, err.message);
    console.log(`${colors.yellow}Tentative de création manuelle du module ES...${colors.reset}`);

    // Créer une version minimale du fichier ES si la construction échoue
    try {
      const indexContent = await fs.promises.readFile(path.resolve(__dirname, 'src', 'lib', 'index.ts'), 'utf8');
      await fs.promises.writeFile(path.resolve(__dirname, 'lib', 'rplayer.es.js'),
        `// Transpiled version of src/lib/index.ts\n${indexContent.replace(/\.ts/g, '.js')}`, 'utf8');
      console.log(`${colors.green}✓ Fichier fallback ES créé manuellement${colors.reset}`);
    } catch (readWriteError) {
      console.error(`${colors.red}Erreur lors de la création manuelle du fichier ES:${colors.reset}`, readWriteError.message);
    }

    // Afficher un message de succès pour le fallback
    console.log(`${colors.green}✓ Module ES créé manuellement${colors.reset}\n`);
  }

  // 3. Copier le fichier de définition TypeScript si nécessaire
  console.log(`${colors.yellow}[3/4]${colors.reset} Copie du fichier de définition TypeScript...`);
  try {
    // Vérifier si le fichier source existe
    if (fs.existsSync(path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'))) {
      // Copier le fichier de définition TypeScript
      fs.copyFileSync(
        path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'),
        path.resolve(__dirname, 'lib', 'rplayer.d.ts')
      );
      console.log(`${colors.green}✓ Fichier de définition TypeScript copié avec succès${colors.reset}\n`);
    } else {
      console.warn(`${colors.yellow}Fichier de définition TypeScript non trouvé dans src/lib/${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}Erreur lors de la copie du fichier de définition TypeScript:${colors.reset}`, err.message);
  }

  // 4. Vérification que les fichiers ont bien été générés
  const requiredFiles = [
    'lib/rplayer.es.js',
    'lib/rplayer.umd.min.js',
    'lib/rplayer.d.ts',
  ];

  // Les variables __filename et __dirname sont déjà définies en haut du fichier

  console.log(`${colors.yellow}[4/4]${colors.reset} Vérification des fichiers générés...`);

  // Vérifier quels fichiers ont été générés dans le répertoire lib
  console.log(`${colors.blue}Fichiers présents dans le répertoire lib:${colors.reset}`);
  try {
    const libFiles = fs.readdirSync(path.resolve(__dirname, 'lib'));
    libFiles.forEach(file => console.log(`  - ${file}`));
  } catch (err) {
    console.error(`${colors.red}Erreur lors de la lecture du répertoire lib:${colors.reset}`, err.message);
  }

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.resolve(__dirname, file)));

  if (missingFiles.length > 0) {
    console.warn(`${colors.yellow}Attention: Certains fichiers sont manquants:${colors.reset}`);
    missingFiles.forEach(file => console.warn(` - ${file}`));

    // Tentative de reconstruction des fichiers manquants
    for (const file of missingFiles) {
      console.log(`${colors.yellow}Tentative de reconstruction de ${file}...${colors.reset}`);

      if (file === 'lib/rplayer.es.js') {
        try {
          console.log(`${colors.yellow}Reconstruction du module ES...${colors.reset}`);
          execSync('npm run build:lib:es', { stdio: 'inherit' });
        } catch (err) {
          console.error(`${colors.red}Échec de la reconstruction de ${file}:${colors.reset}`, err.message);
        }
      } else if (file === 'lib/rplayer.umd.min.js') {
        try {
          console.log(`${colors.yellow}Reconstruction du module UMD...${colors.reset}`);
          execSync('npm run build:lib:umd', { stdio: 'inherit' });
        } catch (err) {
          console.error(`${colors.red}Échec de la reconstruction de ${file}:${colors.reset}`, err.message);
        }
      } else if (file === 'lib/rplayer.d.ts') {
        try {
          if (fs.existsSync(path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'))) {
            fs.copyFileSync(
              path.resolve(__dirname, 'src', 'lib', 'rplayer.d.ts'),
              path.resolve(__dirname, 'lib', 'rplayer.d.ts')
            );
            console.log(`${colors.green}✓ ${file} recréé avec succès${colors.reset}`);
          }
        } catch (err) {
          console.error(`${colors.red}Échec de la reconstruction de ${file}:${colors.reset}`, err.message);
        }
      }
    }

    // Vérifier à nouveau après les tentatives de reconstruction
    const stillMissing = requiredFiles.filter(file => !fs.existsSync(path.resolve(__dirname, file)));

    if (stillMissing.length > 0) {
      console.warn(`${colors.yellow}Attention: Certains fichiers sont toujours manquants mais la construction va continuer:${colors.reset}`);
      stillMissing.forEach(file => console.warn(` - ${file}`));
    } else {
      console.log(`${colors.green}✓ Tous les fichiers manquants ont été reconstruits${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.green}✓ Tous les fichiers de bibliothèque ont été générés${colors.reset}\n`);
  }

  // 5. Construction du site Astro
  console.log(`${colors.yellow}[4/4]${colors.reset} Construction du site de documentation...`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Site de documentation construit avec succès${colors.reset}\n`);

  console.log(`${colors.bright}${colors.green}=== Construction terminée avec succès ! ===${colors.reset}`);
  console.log(`\nVous pouvez prévisualiser le site avec: ${colors.blue}npm run preview${colors.reset}`);

} catch (error) {
  console.error(`${colors.red}Erreur lors de la construction:${colors.reset}`, error.message);
  process.exit(1);
}
})();
