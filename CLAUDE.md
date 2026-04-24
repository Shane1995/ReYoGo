# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run electron:dev        # Start Vite dev server + Electron (hot reload on port 5173)

# Build
pnpm run build               # Full production build (clean + compile main + Vite + electron-builder)
pnpm run electron:build      # Compile main process only (tsc + copy migrations + vite build)

# Database
pnpm run db:generate         # Generate Drizzle migrations after schema changes
pnpm run db:studio           # Open Drizzle interactive studio against dev DB

# Tests
pnpm run test                # Vitest (jsdom)
pnpm run test:ui             # Vitest with browser UI
pnpm run test:coverage       # Coverage report (v8)
# Run a single test file:
pnpm vitest run src/renderer/src/path/to/file.test.ts

# Lint
pnpm run lint                # ESLint strict mode
```

## Architecture

ReYoGo is an Electron + React + TypeScript desktop app (inventory/invoice management). The repo is a single package with three logical zones:

### Zone Layout

```
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

Routes live in `src/renderer/src/components/AppRoutes/routes.tsx`. The tree is layout-based — each section has a layout component (`InventoryLayout`, `InvoiceLayout`, `CostingLayout`, etc.) that wraps child routes via `<Outlet />`. The router uses `electron-router-dom` (not `react-router-dom` directly), configured in `src/main/lib/electron-router-dom.ts`.

### Database

- **Driver:** `better-sqlite3` (synchronous, embedded)
- **ORM:** Drizzle ORM with SQLite dialect
- **Dev DB:** `.data/app-dev.db`; packaged: `app.db` in userData
- **Migrations:** auto-run on startup from `src/main/db/migrations/`; must be `asarUnpack`-ed in electron-builder config so they survive ASAR packaging
- **Schema file:** `src/main/db/drizzle/schema.ts` — single source of truth; regenerate migrations with `db:generate` after any schema change

Key tables: `inventoryItems`, `inventoryCategories`, `capturedInvoices`, `capturedInvoiceLines`, `stockMovements`, `unitsOfMeasure`, `appConfig`, `invoiceAuditLog`

### TypeScript Config Split

| File | Purpose |
|---|---|
| `tsconfig.json` | Shared base (paths, strict, ESNext) |
| `tsconfig.electron.json` | Main process override — CommonJS output to `dist-electron/main/` |
| `vite.config.ts` | Renderer build — outputs to `dist/` for electron-builder |

Path aliases: `@/*` → `src/renderer/src/*`, `@main/*` → `src/main/*`, `@shared` → `src/shared`

### UI Stack

- Tailwind CSS + `tailwindcss-animate`
- shadcn/ui components (`components.json` at root)
- Lucide React icons
- Recharts for data visualisation
- No global state library — React Context where needed, `useState` otherwise
