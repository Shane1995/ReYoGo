<p align="center">
  <img src="packages/desktop/src/renderer/public/logo.png" alt="ReYoGo logo" width="120" />
</p>

# ReYoGo

Inventory and invoice management — Electron desktop app and React web app built with TypeScript and Vite.

This repo is a **pnpm monorepo** orchestrated by Turborepo.

```
packages/
  desktop/   @reyogo/desktop — Electron + React + TypeScript desktop app
  web/       @reyogo/web     — React + Vite web app
  shared/    @reyogo/shared  — Entity types and Zod validation schemas
  config/    @reyogo/config  — Shared Tailwind preset and Vite config factory
```

## Prerequisites

- Node.js 24 (use `.node-version` or `nvm use`)
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Getting started

```bash
pnpm install
pnpm electron:dev     # Electron desktop app with HMR
pnpm web:dev          # Web app dev server on :5174
```

## Commands

All commands run from the repo root via Turborepo.

```bash
# Desktop
pnpm electron:dev          # Start desktop app (electron-vite dev)
pnpm electron:build        # Build desktop app to out/

# Web
pnpm web:dev               # Start web dev server on :5174
pnpm web:build             # Production build
pnpm web:preview           # Preview the production build

# Quality (all packages)
pnpm run lint              # Lint all packages
pnpm run typecheck         # Type-check all packages
pnpm run test              # Run all tests
pnpm run build             # Full production build
```

### Desktop-specific

```bash
pnpm --filter @reyogo/desktop run build:win    # Windows installer
pnpm --filter @reyogo/desktop run build:mac    # macOS DMG
pnpm --filter @reyogo/desktop run db:generate  # Generate Drizzle migrations
pnpm --filter @reyogo/desktop run db:studio    # Open Drizzle Studio
```

## Architecture

### Desktop (`packages/desktop`)

Electron app with three zones inside `src/`:

| Zone | Purpose |
|---|---|
| `src/main/` | Electron main process — SQLite via better-sqlite3 + Drizzle ORM, IPC handlers |
| `src/renderer/` | React 18 app rendered in BrowserWindow, built by electron-vite |
| `src/shared/` | TypeScript types + IPC channel definitions — imported by both main and renderer |

**IPC data flow** (every feature):  
`src/shared/types/ipc/` → `src/main/dataAccess/` → `src/main/handlers/` → `src/renderer/src/services/`

The preload script (`src/main/preload.ts`) is the security boundary — it exposes `window.electronAPI` with `contextIsolation: true` and `nodeIntegration: false`.

### Web (`packages/web`)

React 18 + Vite SPA. Consumes entity types from `@reyogo/shared`. Dev server runs on `:5174` (desktop uses `:5173`).

### Shared packages

| Package | Purpose |
|---|---|
| `@reyogo/shared` | Entity interfaces and Zod validation schemas consumed by desktop, web, and future lambdas |
| `@reyogo/config` | Shared Tailwind CSS preset (`tailwind.preset.ts`) and Vite config factory (`vite.base.ts`) |

## CI/CD

| Workflow | Trigger |
|---|---|
| CI | PR to `main` — lint, typecheck, test, build-desktop, build-web (turbo `--affected`) |
| Release Desktop to Staging | Manual — bumps beta version tag, builds Windows installer, uploads to S3 staging, optionally promotes to production |
| Release Desktop to Production | On non-beta `v*` tag push — builds Windows installer, uploads to S3 production, creates GitHub release |
