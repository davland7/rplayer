# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.2] - 2026-02-15
### Added
- Added ⚛️ React Demo (CodeSandbox) link in the README.
- Added atom emoji for the React Demo link.

### Changed
- Improved visibility of demo options in the README.

### Fixed
- Minor documentation fixes.
- Fix: `supportsHls()` is now a static method on `RPlayer` as intended.

---

## [3.0.0] - 2026-02-01
### Added
- Major release: RPlayer III, complete rewrite and modernized API.
- Static helpers: `supportsHls()`, `isHls(url)`, `isIos()`.
- Native HLS support (detection, no HLS.js included).
- TypeScript types published in `types/rplayer.d.ts`.

### Changed
- Simplified API and improved documentation.
- Removed all external dependencies.

### Removed
- Removed default HLS.js integration (now integrate manually if needed).
