# King's Bounty Font Resizer

A small desktop utility for King's Bounty: The Legend that safely scales in-game font sizes by modifying the game's configuration files.

⚠️ **Status:** Early access.

## Motivation

King's Bounty: The Legend does not provide built-in UI or font scaling options. Manually editing font configuration files is possible but tedious and error-prone.

This tool aims to:

- make font scaling quick and repeatable
- preserve original files via automatic backups
- provide a simple GUI instead of manual config edits

This is especially useful when playing on smaller screens (such as Steam Deck or similar handheld PCs) or for players who benefit from larger, more readable UI text.

## Usage (Early Access)

1. Navigate to the `data/` subfolder inside your **King’s Bounty: The Legend** installation.
2. Place the app **next to `fonts.cfg`** (inside the `data/` folder).
3. Run the app.
4. Choose a delta (e.g., `+2`) and click **Apply Changes**.

```
Example layout:

King's Bounty The Legend/
  data/
    fonts.cfg
    kings-bounty-font-resizer.exe
```

### Backup & Restore
- On first apply, the app creates `fonts.cfg.bak` (only if it doesn’t already exist).
- **Revert Changes** copies `fonts.cfg.bak` back to `fonts.cfg` and then removes the backup (one-shot restore).

⚠️ Early access: UI is minimal and there is no file picker / auto-detection yet.

### Troubleshooting (GOG Galaxy)

Known issue: If GOG Galaxy is running while this tool applies changes, the next launch from Galaxy may fail until this tool is closed (or Galaxy is restarted).

Workarounds:
- Preferred: After applying changes, **close this tool** and then launch the game from GOG Galaxy.
- Alternative: Launch the game **directly from the game executable** (kb.exe) (bypassing GOG Galaxy).

This does not affect the game files themselves; it appears to be a launcher interaction.

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

# run UI/React tests (jsdom; may be empty early on)
pnpm test:react

# run Rust integration tests (Tauri backend)
pnpm test:rust
```

**Note:** Running the app outside the actual game directory during development is expected.

## License

TBD
