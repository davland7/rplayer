# Changelog

Tous les changements notables apportés à ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-06-14

### Ajouté

- Refonte complète de l'interface avec Astro et React
- Composant Player React pour une meilleure démo
- Support pour TypeScript avec typages améliorés
- Documentation interactive avec exemples en direct
- Nouvelle API pour une meilleure gestion du flux audio

### Changé

- Renommage de la classe `Rplayer` en `RPlayer` pour respecter les conventions de nommage
- Amélioration de la gestion des erreurs pour les flux HLS
- Mises à jour des dépendances (hls.js v1.6.1)
- Refactorisation de la logique principale pour une meilleure maintenabilité
- Le format d'exportation est maintenant en module ES par défaut

### Corrigé

- Correction du problème de fuite de mémoire lors de la destruction du lecteur
- Amélioration de la compatibilité avec Safari sur iOS
- Correction des problèmes de volume sur différents navigateurs
- Gestion améliorée des flux non disponibles

### Supprimé

- Support pour les anciennes versions d'Internet Explorer
