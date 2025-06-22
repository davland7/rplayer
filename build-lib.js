#!/usr/bin/env node

/**
 * Script simple pour construire seulement la bibliothèque RPlayer
 * Cette version évite les complexités et se concentre uniquement sur la génération des fichiers nécessaires
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir les chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Construction simplifiée de la bibliothèque RPlayer v3.0.0 ===\n');

try {
  // S'assurer que le répertoire lib existe
  const libDir = path.resolve(__dirname, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    console.log('Répertoire lib créé\n');
  }

  // Utiliser npm run pour exécuter les commandes Vite via les scripts définis
  // Construire la version UMD
  console.log('Construction du module UMD pour CDN...');
  execSync('npm run build:lib:umd', { stdio: 'inherit' });
  console.log('Module UMD construit avec succès\n');

  // Construire la version ES
  console.log('Construction du module ES...');
  execSync('npm run build:lib:es', { stdio: 'inherit' });
  console.log('Module ES construit avec succès\n');

  // Vérifier les fichiers générés
  console.log('Vérification des fichiers générés:');
  const libFiles = fs.readdirSync(libDir);

  if (libFiles.length > 0) {
    console.log('Fichiers présents dans lib/:');
    libFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.error('Aucun fichier trouvé dans le répertoire lib/');
    process.exit(1);
  }

  console.log('\nBibliothèque construite avec succès!');
} catch (error) {
  console.error('Erreur lors de la construction:', error.message);
  process.exit(1);
}
