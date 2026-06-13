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
pnpm electron:dev                          # Start Vite dev server + Electron (hot reload)

# Build
pnpm electron:build                        # Compile main process only (tsc + copy migrations + vite)

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
| `packages/desktop/tsconfig.json` | Renderer + shared — extends base, adds DOM, JSX, path aliases |
| `packages/desktop/tsconfig.electron.json` | Main process — CommonJS output to `dist-electron/main/` |
| `packages/desktop/vite.config.ts` | Renderer build — outputs to `dist/` for electron-builder |

Path aliases (within `packages/desktop`): `@/*` → `src/renderer/src/*`, `@main/*` → `src/main/*`, `@shared` → `src/shared`

### UI Stack

- Tailwind CSS + `tailwindcss-animate`
- shadcn/ui components (`components.json` in `packages/desktop/`)
- Lucide React icons
- Recharts for data visualisation
- No global state library — React Context where needed, `useState` otherwise

## File Organization Conventions

These conventions apply across the renderer codebase. The `CsvImport` feature
(`apps/desktop/src/renderer/src/components/CsvImport/`) is the reference
example — refer to it when in doubt.

1. **No inline types/interfaces in `index.ts(x)` files.** Extract them to a
   co-located `types.ts`. Desktop-local types use unprefixed names (e.g.
   `ReviewItem`, `CategoryRowProps`) — the `I`-prefix convention is reserved
   for types re-exported from `@reyogo/types`. If a type is consumed outside
   its own directory, re-export it from `index.ts`.
2. **No inline constants or magic strings.** Extract them to a co-located
   `constants.ts` (e.g. `STATUS_CONFIG` in
   `components/StatusBadge/constants.ts`).
3. **Prefer a real TS `enum` over an `as const` object literal** for a fixed
   set of values (e.g. `ReviewStatus` in `review/constants.ts`), *except* IPC
   channel name objects, which must stay `as const` for `TypedInvoke`
   inference. Before converting a value set to an enum, check whether it is
   persisted to SQLite or sent across the IPC boundary — if so, keep it as a
   string union/`as const` object instead.
4. **No `as` type assertions in anything you touch.** Fix the underlying
   types instead — e.g. add an explicit type annotation so enum members
   aren't widened, or give IPC enums an `as const` object so `TypedInvoke`
   infers correctly.
5. **One function per component file.** Extract helper functions to `hooks/`
   (stateful) or `utils/` (pure) alongside the component.
6. **Naming/layout:** every unit of code lives at
   `<dir>/<Name>/index.ts(x)`, with tests at `<dir>/<Name>/index.test.ts(x)`,
   inline types in `<dir>/<Name>/types.ts`, and inline constants in
   `<dir>/<Name>/constants.ts`.
7. **Every extracted hook or util keeps (or gains) `index.test.ts` coverage**
   — e.g. `utils/resolveCategoryAssignment`,
   `ImportReview/utils/unresolvedItemsMessage`.
8. **Prefer `const` over `let`; avoid in-place mutation** — build new
   arrays/objects rather than mutating existing ones.
9. **Sub-components extracted from a component live in a co-located
   `components/` directory:**
   - If used by only one parent, place it at
     `<Parent>/components/<Name>/`.
   - If shared by multiple siblings, place it at the lowest common ancestor's
     `components/<Name>/` — e.g. `CsvImport/components/StatusBadge/` (used by
     `CategoryRow`, `ItemRow`, and `UnitRow`) vs.
     `CsvImport/ImportReview/components/CategoryRow/` (used only within
     `ImportReview`).
