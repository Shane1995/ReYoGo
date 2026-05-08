# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm workspace with Turborepo orchestration.

```
packages/
  desktop/   Electron + React + TypeScript desktop app (@reyogo/desktop)
```

## Commands

Run from the **repo root** unless otherwise noted.

```bash
# Development
pnpm electron:dev                          # Start electron-vite dev server + Electron (built-in HMR)

# Build
pnpm electron:build                        # Compile all three targets (main, preload, renderer) via electron-vite → out/

# Turbo (all packages)
pnpm run build                             # turbo run build
pnpm run test                              # turbo run test
pnpm run lint                              # turbo run lint
pnpm run typecheck                         # turbo run typecheck
pnpm run clean                             # turbo run clean

# Filtered to desktop
pnpm --filter @reyogo/desktop run <script>

# Database (run from packages/desktop or via filter)
pnpm --filter @reyogo/desktop run db:generate   # Generate Drizzle migrations
pnpm --filter @reyogo/desktop run db:studio     # Open Drizzle studio against dev DB

# Tests
pnpm run test                              # All packages via turbo
pnpm --filter @reyogo/desktop exec vitest run src/renderer/src/path/to/file.test.ts
```

## Architecture

ReYoGo is an Electron + React + TypeScript desktop app (inventory/invoice management).

### Package Layout

```
packages/desktop/
  src/main/        Electron main process — SQLite, IPC handlers, data access
  src/renderer/    React app (Vite, rendered in BrowserWindow)
  src/shared/      Types only — no runtime code, imported by both sides
```

### IPC Data Flow

Every feature follows the same 4-layer contract:

1. **`src/shared/types/ipc/`** — enum of channel names (e.g. `InventoryIPC.GET_CATEGORIES`) + TypeScript contract types in `src/shared/types/contract/`
2. **`src/main/dataAccess/`** — pure Drizzle query functions, no IPC awareness
3. **`src/main/handlers/`** — `ipcMain.handle(channel, fn)` wrappers that call data access; registered via `registerIPC()` in `main.ts`
4. **`src/renderer/src/services/`** — thin client wrappers that call `window.electronAPI.ipcRenderer.invoke(channel, ...args)`; consumed by components/hooks

The preload script (`src/main/preload.ts`) is the security boundary — it exposes `window.electronAPI` with `contextIsolation: true`, `nodeIntegration: false`.

### App Startup Sequence

`AppLoader` drives the state machine:
1. Renderer sends `DB_REQUEST_READY_CHANNEL` via `appService.requestAppReady()`
2. Main initializes SQLite + runs migrations, then fires `getDbReadyChannel()`
3. Renderer receives the signal; `AppLoader` checks if setup is complete
4. Incomplete → `SetupWizard`; complete → `AppRoutes` wrapped in `ErrorBoundary`

### Routing

Routes live in `packages/desktop/src/renderer/src/components/AppRoutes/routes.tsx`. The tree is layout-based — each section has a layout component that wraps child routes via `<Outlet />`. The router uses `electron-router-dom` (not `react-router-dom` directly), configured in `src/main/lib/electron-router-dom.ts`.

### Database

- **Driver:** `better-sqlite3` (synchronous, embedded)
- **ORM:** Drizzle ORM with SQLite dialect
- **Dev DB:** `.data/app-dev.db`; packaged: `app.db` in userData
- **Migrations:** auto-run on startup from `src/main/db/migrations/`; must be `asarUnpack`-ed in electron-builder config so they survive ASAR packaging
- **Schema file:** `src/main/db/drizzle/schema.ts` — single source of truth; regenerate migrations with `db:generate` after any schema change

### TypeScript Config Split

| File | Purpose |
|---|---|
| `tsconfig.base.json` (root) | Shared strict base extended by all packages |
| `packages/desktop/tsconfig.json` | Renderer + main + shared — extends base, adds DOM, JSX, path aliases |
| `packages/desktop/electron.vite.config.ts` | Unified build config: main, preload, and renderer Vite sub-configs |

**Removed:** `tsconfig.electron.json` (electron-vite handles main/preload transpilation via esbuild), `vite.config.ts` (replaced by `electron.vite.config.ts` renderer section).

**Output layout:** `out/main/index.js`, `out/preload/index.js`, `out/renderer/index.html` (was `dist-electron/` + `dist/`).

Path aliases (within `packages/desktop`): `@/*` → `src/renderer/src/*`, `@main/*` → `src/main/*`, `@shared` → `src/shared`

### UI Stack

- Tailwind CSS + `tailwindcss-animate`
- shadcn/ui components (`components.json` in `packages/desktop/`)
- Lucide React icons
- Recharts for data visualisation
- No global state library — React Context where needed, `useState` otherwise
