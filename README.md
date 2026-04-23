# LippTV

LippTV is a modern desktop IPTV and streaming player built with Electron, React and TypeScript. The goal is to provide a fast, stable and polished experience for users who want to organize and play their own authorized IPTV sources on Windows.

> LippTV does not provide playlists, channels, movies, series, credentials or streaming content. The app is only a player/client for sources supplied by the user, who must have the legal right to access them.

## Highlights

- Desktop app for Windows powered by Electron.
- Premium dark/light interface with custom title bar.
- Internal web player focused on HLS/M3U8 playback.
- Playlist import from M3U file or URL.
- Initial connector structure for Xtream API and Stalker/MAG-compatible portals.
- Live TV, Movies and Series organization.
- Favorites, playback history and playback preferences.
- Fast search and category navigation.
- Virtualized lists for large catalogs.
- Local persistence with Electron-friendly storage.
- Safer Electron defaults with isolated renderer and preload bridge.

## Screenshots

Screenshots will be added soon. If you are contributing UI improvements, feel free to open a PR adding updated images from the latest build.

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Zustand
- hls.js
- mpegts.js
- @tanstack/react-virtual
- electron-store
- electron-builder

## Project Goals

LippTV is designed around three priorities:

- Performance: large IPTV catalogs should not freeze the interface.
- Stability: playback errors should be handled gracefully whenever possible.
- UX quality: the app should feel like a real streaming product, not a generic playlist viewer.

## Architecture

```text
LippTV/
|-- electron/
|   |-- services/
|   |   |-- connectors/
|   |   |-- importService.ts
|   |   `-- store.ts
|   |-- utils/
|   |-- workers/
|   |-- ipc.ts
|   |-- main.ts
|   `-- preload.ts
|-- src/
|   |-- renderer/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- i18n/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- stores/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   `-- styles.css
|   `-- shared/
|-- index.html
|-- package.json
|-- tsconfig.app.json
|-- tsconfig.main.json
`-- vite.config.ts
```

## How It Works

The Electron main process owns the native desktop window, IPC handlers, local persistence and heavy import work. The renderer is a React app responsible for navigation, catalog UI, playback controls and user experience.

Large playlists are parsed outside the critical UI path, and catalog rendering uses virtualized lists so thousands of entries can be browsed without rendering everything at once.

## Supported Sources

- M3U playlists from file.
- M3U playlists from URL.
- Direct HLS/M3U8 streams.
- Xtream API-compatible accounts, when authorized by the user.
- Stalker/MAG-compatible portals, when authorized by the user.

Some providers use non-standard formats, custom headers, tokenized URLs or anti-hotlinking behavior. Compatibility can vary and should be improved through provider-agnostic fixes, not source-specific bypasses.

## Getting Started

### Requirements

- Node.js 20 or newer.
- npm 10 or newer.
- Windows is the primary target right now.

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

This starts TypeScript watch mode for Electron, Vite for the renderer and then opens the desktop app.

### Type Check

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
```

### Package App

```bash
npm run pack
```

### Create Installer

```bash
npm run dist
```

Build artifacts are generated in `release/`.

## Available Scripts

- `npm run dev`: starts the app in development mode.
- `npm run build`: builds renderer and Electron main process.
- `npm run build:renderer`: builds the Vite renderer.
- `npm run build:main`: compiles Electron TypeScript files.
- `npm run typecheck`: runs TypeScript checks for app and main process.
- `npm run preview`: previews the Vite renderer build.
- `npm run pack`: creates an unpacked desktop build.
- `npm run dist`: creates a distributable installer with electron-builder.

## Security Notes

LippTV follows safer Electron defaults:

- `nodeIntegration` is disabled.
- `contextIsolation` is enabled.
- Renderer access to native features goes through `preload.ts`.
- IPC is exposed as a narrow API instead of giving the UI direct Node access.
- Input sources should be validated and handled defensively.

For open source contributors: please avoid adding code that bypasses authorization systems, scrapes protected services, embeds third-party credentials or distributes copyrighted playlists.

## Legal and Responsible Use

This repository is intended for legitimate personal media access, authorized IPTV subscriptions, internal testing and open source learning.

Do not use LippTV to access content without permission. Do not open issues requesting playlists, pirated content, provider credentials or help bypassing access controls.

## Roadmap

- Improve EPG ingestion and local caching.
- Add smarter logo cache and fallback logo matching.
- Expand Xtream API catalog sync.
- Expand Stalker/MAG portal compatibility.
- Add subtitle and audio track selection UI.
- Add provider/profile management.
- Add automated tests for malformed M3U files and large playlists.
- Add CI for typecheck and build validation.
- Add code splitting to reduce renderer bundle size.
- Improve installer metadata, app icon and release workflow.

## Contributing

Contributions are welcome. The best areas to help right now are:

- Playback stability across HLS variants.
- UI polish and accessibility.
- Large playlist performance.
- Tests for parsers and connectors.
- Documentation and screenshots.
- Packaging and release automation.

Before opening a PR, please run:

```bash
npm run typecheck
npm run build
```

## Development Principles

- Keep the renderer responsive.
- Prefer background work for expensive parsing or catalog processing.
- Keep Electron IPC explicit and narrow.
- Avoid source-specific hacks when a general compatibility improvement is possible.
- Treat malformed playlists and network failures as expected scenarios.
- Keep UI components reusable and easy to evolve.

## License

MIT. See [LICENSE](LICENSE).
