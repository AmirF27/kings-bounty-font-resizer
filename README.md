# King's Bounty Font Resizer

A small desktop utility for King's Bounty: The Legend that safely scales in-game font sizes by modifying the game's configuration files.

⚠️ **Status:** Work in progress — not released yet.

## Motivation

King's Bounty: The Legend does not provide built-in UI or font scaling options. Manually editing font configuration files is possible but tedious and error-prone.

This tool aims to:

- make font scaling quick and repeatable
- preserve original files via automatic backups
- provide a simple GUI instead of manual config edits

This is especially useful when playing on smaller screens (such as Steam Deck or similar handheld PCs) or for players who benefit from larger, more readable UI text.

## Planned Features (v1.0)

- Increase / decrease all font sizes by a fixed amount
- Preview changes before applying them
- Automatic backup and restore of the original configuration
- Portable mode: run the app directly from the game folder

## Tech Stack

- **Tauri** — lightweight desktop shell
- **React + TypeScript** — UI and logic
- **Rust (Tauri backend)** — filesystem access and safety

## Development Status

This project is currently under active development. Early milestones focus on:

- robust config parsing
- safe read/write operations
- a minimal but clear UI

User-facing releases will be published once the core functionality is stable.

## Development Setup

```bash
# install dependencies
pnpm install

# run the app in development mode
pnpm tauri dev

# lint the codebase
pnpm lint

# run type checks
pnpm exec tsc --noEmit

# run core logic tests (Node environment)
pnpm test:core

# run UI tests (jsdom; may be empty early on)
pnpm test:ui

# run Rust integration tests (Tauri backend)
cd src-tauri
cargo test
cd ..
```

**Note:** Running the app outside the actual game directory during development is expected.

## License

TBD
