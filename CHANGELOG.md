# Changelog

All notable changes to this library are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-08-25

### Added
- TypeScript support with improved typings
- New API for better audio stream management
- Native `playM3u()`, `next()`, and `previous()` methods for M3U playlists
- Added `getCurrentPlaylist()` method to get playlist information
- Full support for M3U playlists with navigation
- Reorganized playlist management code into `playM3u.ts` module
- Global playlist state management with automatic track handling
- Added `onLoadingStatusChange()` method for detailed loading status events
- Added better buffering state detection and feedback
- Fixed title parsing for M3U entries containing commas
- Improved HLS audio stream detection

### Changed
- Renamed class `Rplayer` to `RPlayer` for naming consistency
- Improved error handling for HLS streams
- Updated dependencies (hls.js v1.6.1)
- Refactored core logic for better maintainability
- Default export format is now ES module

### Fixed
- Fixed memory leak when destroying the player
- Improved compatibility with Safari on iOS
- Fixed volume issues on various browsers
- Better handling of unavailable streams

### Removed
- Dropped support for legacy Internet Explorer
