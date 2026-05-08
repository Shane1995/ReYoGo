<p align="center">
  <img src="packages/desktop/src/renderer/public/logo.png" alt="ReYoGo logo" width="120" />
</p>

# ReYoGo

Inventory and invoice management — Electron desktop app built with React, TypeScript, and Vite.

This repo is a **pnpm monorepo** orchestrated by Turborepo.

```
packages/
  desktop/   @reyogo/desktop — Electron + React + TypeScript desktop app
```

## Prerequisites

- Node.js 24 (use `.node-version` or `nvm use`)
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Getting started

```bash
pnpm install
pnpm electron:dev     # Vite dev server + Electron with hot reload
```

## Commands

All commands run from the repo root via Turborepo.

```bash
# Development
pnpm electron:dev          # Start desktop app in dev mode

# Quality
pnpm run lint              # Lint all packages
pnpm run typecheck         # Type-check all packages
pnpm run test              # Run all tests

# Build
pnpm electron:build        # Compile main process + Vite renderer
pnpm run build             # Full production build (includes electron-builder)
```

### Desktop-specific commands

```bash
pnpm --filter @reyogo/desktop run build:win    # Windows installer
pnpm --filter @reyogo/desktop run build:mac    # macOS DMG
pnpm --filter @reyogo/desktop run db:generate  # Generate Drizzle migrations
pnpm --filter @reyogo/desktop run db:studio    # Open Drizzle Studio
```

## Architecture

ReYoGo is an Electron app with three logical zones inside `packages/desktop/src/`:

| Zone | Purpose |
|---|---|
| `src/main/` | Electron main process — SQLite via better-sqlite3 + Drizzle ORM, IPC handlers |
| `src/renderer/` | React 18 app rendered in BrowserWindow, built by Vite |
| `src/shared/` | TypeScript types only — imported by both main and renderer |

**IPC data flow** (every feature):  
`src/shared/types/ipc/` → `src/main/dataAccess/` → `src/main/handlers/` → `src/renderer/src/services/`

The preload script (`src/main/preload.ts`) is the security boundary — it exposes `window.electronAPI` with `contextIsolation: true` and `nodeIntegration: false`.

## CI/CD

| Workflow | Trigger |
|---|---|
| CI | PR to `main` — lint, typecheck, test, desktop build |
| Release Desktop to Staging | Manual — bumps beta version tag, builds Windows installer, uploads to S3 staging, optionally promotes to production |
| Release Desktop to Production | On non-beta `v*` tag push — builds Windows installer, uploads to S3 production, creates GitHub release |
