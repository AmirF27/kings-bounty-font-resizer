# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 


## [0.2.0] - 2026-02-02

### Added
- Minimal UI to apply font scaling by a chosen delta.
- Automatic backup creation (`fonts.cfg.bak`) on first apply.
- Restore from backup (one-shot restore removes `.bak`).
- Status messages and disabled actions while operations are running.

### Notes
- Early access release: UI is minimal; no file picker/auto-detection yet.


## [0.1.0] – 2026-01-26

### Added
- Initial project scaffolding
- CI pipeline (linting, type checks, tests, builds)
- Cross-platform build setup (Windows MSI, Linux AppImage)
