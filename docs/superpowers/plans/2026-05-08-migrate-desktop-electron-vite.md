# Migrate Desktop to electron-vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Vite 5 + manual `tsc` main-process compilation workflow with electron-vite, giving the desktop package a single unified config file that handles main, preload, and renderer — while preserving electron-builder packaging, all three existing tests, and the Turborepo task graph.

**Architecture:** electron-vite wraps three Vite sub-configs (main, preload, renderer) in one `electron.vite.config.ts`. The renderer sub-config absorbs the existing plugin-react setup and path aliases. The main and preload sub-configs replace `tsconfig.electron.json` compilation; electron-vite transpiles those targets via Vite internally. electron-builder is untouched except for updated `files` globs that match electron-vite's conventional output layout (`out/` instead of `dist/` + `dist-electron/`). The `vitest.config.ts` remains independent and is unaffected. `concurrently` + `wait-on` are removed; `electron-vite dev` replaces them.

**Tech Stack:** electron-vite 2.x, Vite 5 (peer dep of electron-vite), @vitejs/plugin-react, electron-builder 24, Vitest 1, pnpm workspaces, Turborepo.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/desktop/electron.vite.config.ts` | Single unified config: main + preload + renderer Vite sub-configs |
| Delete | `packages/desktop/vite.config.ts` | Replaced by `electron.vite.config.ts` renderer section |
| Delete | `packages/desktop/tsconfig.electron.json` | Replaced by electron-vite's built-in main/preload transpilation |
| Delete | `packages/desktop/tsconfig.node.json` | Was only referenced by the old `vite.config.ts` via project references |
| Modify | `packages/desktop/tsconfig.json` | Remove `references` array; add `electron.vite.config.ts` to include |
| Modify | `packages/desktop/package.json` | Add `electron-vite`; remove `concurrently`, `wait-on`; rewrite scripts |
| Modify | `packages/desktop/electron-builder.config.js` | Update `files` globs and `asarUnpack` to match `out/` layout |
| Modify | `packages/desktop/src/main/main.ts` | Update preload path and HTML paths for new output layout |
| Modify | `packages/desktop/src/main/db/index.ts` | Update migrations path for new output layout |
| Keep | `packages/desktop/vitest.config.ts` | Unaffected — vitest runs independently |
| Keep | `packages/desktop/tailwind.config.js` | Content globs match source tree, unchanged |
| Keep | `packages/desktop/postcss.config.cjs` | Unchanged |

### electron-vite output layout

electron-vite writes to `out/` by default:

```
out/
  main/index.js          ← was dist-electron/main/main.js
  preload/index.js       ← was dist-electron/main/preload.js
  renderer/index.html    ← was dist/index.html
```

---

## Task 1: Install electron-vite and remove obsolete dev dependencies

**Files:** `packages/desktop/package.json`

- [ ] **Step 1: Update devDependencies**

Add `"electron-vite": "^2.3.0"`, remove `"concurrently"` and `"wait-on"`.

- [ ] **Step 2: Run install**

```bash
pnpm install
```

Expected: lockfile updated, `electron-vite` in `.pnpm`.

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/package.json pnpm-lock.yaml
git commit -m "chore(desktop): add electron-vite, drop concurrently and wait-on

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Create electron.vite.config.ts and remove vite.config.ts

**Files:**
- Create: `packages/desktop/electron.vite.config.ts`
- Delete: `packages/desktop/vite.config.ts`

- [ ] **Step 1: Create `packages/desktop/electron.vite.config.ts`**

```typescript
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { Plugin } from 'vite';

function copyMigrationsPlugin(): Plugin {
  return {
    name: 'copy-migrations',
    closeBundle() {
      const src = resolve(__dirname, 'src/main/db/migrations');
      const dest = resolve(__dirname, 'out/main/db/migrations');
      copyDir(src, dest);
    },
  };
}

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyMigrationsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(__dirname, './src/main'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/main.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload.ts'),
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    base: './',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/renderer/src'),
        '@main': resolve(__dirname, './src/main'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  },
});
```

- [ ] **Step 2: Delete old config**

```bash
git rm packages/desktop/vite.config.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/electron.vite.config.ts
git commit -m "feat(desktop): add electron.vite.config.ts, remove vite.config.ts

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Update tsconfig.json, delete tsconfig.electron.json and tsconfig.node.json

**Files:**
- Modify: `packages/desktop/tsconfig.json`
- Delete: `packages/desktop/tsconfig.electron.json`
- Delete: `packages/desktop/tsconfig.node.json`

- [ ] **Step 1: Update `packages/desktop/tsconfig.json`**

Read the current file first. Remove the `"references"` array entirely and add `"electron.vite.config.ts"` to `include`. The `compilerOptions` and `include` for `src/` stay unchanged.

- [ ] **Step 2: Delete obsolete tsconfig files**

```bash
git rm packages/desktop/tsconfig.electron.json
git rm packages/desktop/tsconfig.node.json 2>/dev/null || true
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

Expected: exits 0. (The `typecheck` script will be updated in Task 4 to drop `tsc -p tsconfig.electron.json`.)

- [ ] **Step 4: Commit**

```bash
git add packages/desktop/tsconfig.json
git commit -m "chore(desktop): remove tsconfig.electron.json, clean up project references

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Rewrite package.json scripts and update "main" entry point

**Files:** `packages/desktop/package.json`

- [ ] **Step 1: Update `"main"` field** (top-level, not inside scripts)

```json
"main": "out/main/index.js"
```

- [ ] **Step 2: Replace the `"scripts"` block**

```json
"scripts": {
  "dev": "electron-vite dev",
  "clean": "shx rm -rf out release",
  "build": "pnpm run clean && electron-vite build && electron-builder --publish never --config electron-builder.config.js",
  "build:win": "pnpm run clean && electron-vite build && electron-builder --win --publish never --config electron-builder.config.js",
  "build:mac": "pnpm run clean && electron-vite build && electron-builder --mac --publish never --config electron-builder.config.js",
  "build:all": "pnpm run clean && electron-vite build && electron-builder --win --mac --publish never --config electron-builder.config.js",
  "preview": "electron-vite preview",
  "test": "vitest run --passWithNoTests",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "electron:dev": "electron-vite dev",
  "electron:build": "shx rm -rf out && electron-vite build",
  "db:reset": "node scripts/remove-db.js",
  "db:generate": "drizzle-kit generate",
  "db:studio": "drizzle-kit studio",
  "postinstall": "electron-builder install-app-deps",
  "typecheck": "tsc --noEmit",
  "lint": "oxlint --config ../../packages/config/oxlint.json src/",
  "format": "oxfmt src/",
  "format:check": "oxfmt --check src/"
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add packages/desktop/package.json
git commit -m "feat(desktop): rewrite scripts for electron-vite CLI, update main entry point

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Update main.ts — preload path and HTML paths

**Files:** `packages/desktop/src/main/main.ts`

Two path changes:
1. Preload: `join(__dirname, 'preload.js')` → `join(__dirname, '../preload/index.js')`
2. Production HTML: `join(app.getAppPath(), 'dist', 'index.html')` → `join(app.getAppPath(), 'out', 'renderer', 'index.html')`
3. Dev HTML: `join(__dirname, '../../dist/index.html')` → `join(__dirname, '../../out/renderer/index.html')`

Read `src/main/main.ts` first to find the exact lines, then make these three targeted edits.

- [ ] **Step 1: Update preload path**

Find the `preload:` line in the `webPreferences` object and change it to:
```typescript
preload: join(__dirname, '../preload/index.js'),
```

- [ ] **Step 2: Update HTML paths**

Find the production/dev `htmlPath` or `htmlFile` resolution and update both branches to use `out/renderer/index.html`.

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/desktop/src/main/main.ts
git commit -m "fix(desktop): update preload and HTML paths for electron-vite out/ layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Update db/index.ts — migrations path

**Files:** `packages/desktop/src/main/db/index.ts`

The migrations path changes from `join(__dirname, 'migrations')` to `join(__dirname, 'db', 'migrations')` because the main entry is now `out/main/index.js` (one level deeper than before).

Read `src/main/db/index.ts` first to find the exact migration path resolution, then update the relative path.

- [ ] **Step 1: Update migration folder path**

The ASAR unpacking branch must also be updated — replace `app.asar` → `app.asar.unpacked` in the resolved path, keeping the new `db/migrations` suffix:

```typescript
const migrationsFolder =
  app.isPackaged && __dirname.includes('app.asar')
    ? join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'db', 'migrations')
    : join(__dirname, 'db', 'migrations');
```

- [ ] **Step 2: Verify build output includes migrations**

```bash
pnpm --filter @reyogo/desktop run electron:build
ls packages/desktop/out/main/db/migrations/
```

Expected: SQL migration files listed.

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/src/main/db/index.ts
git commit -m "fix(desktop): update migrations folder path for electron-vite out/ layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Update electron-builder.config.js and turbo.json

**Files:**
- Modify: `packages/desktop/electron-builder.config.js`
- Modify: `turbo.json` (root)

- [ ] **Step 1: Update electron-builder.config.js**

Read the current file first. Update only these two fields:

```javascript
files: ['out/**/*', 'package.json'],
asarUnpack: ['out/main/db/migrations/**'],
```

- [ ] **Step 2: Update turbo.json outputs**

Change `"dist/**"` and `"dist-electron/**"` to `"out/**"` in the `build` and `electron:build` tasks:

```json
"build": {
  "dependsOn": ["^build"],
  "outputs": ["out/**", "release/**"]
},
"electron:build": {
  "dependsOn": ["^build"],
  "outputs": ["out/**"]
},
```

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/electron-builder.config.js turbo.json
git commit -m "chore(desktop): update electron-builder globs and turbo outputs for out/ layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Verify existing tests still pass

- [ ] **Step 1: Run desktop tests**

```bash
pnpm --filter @reyogo/desktop run test
```

Expected:
```
✓ src/renderer/src/hooks/useAutoUpdater.test.ts (2 tests)
✓ src/renderer/src/components/UpdateToast/UpdateToast.test.tsx (3 tests)
✓ src/renderer/src/components/VersionBar/VersionBar.test.tsx (2 tests)
Test Files  3 passed (3)
Tests       7 passed (7)
```

- [ ] **Step 2: If tests fail — check vitest.config.ts alias map**

The most likely cause is path alias resolution. Confirm `vitest.config.ts` still has the correct aliases pointing to `src/renderer/src`, `src/main`, `src/shared`. No changes to this file should be needed.

---

## Task 9: Dev smoke test

- [ ] **Step 1: Start electron-vite dev**

```bash
pnpm --filter @reyogo/desktop run dev
```

Expected: electron-vite prints main/preload build done + renderer server started, then an Electron window opens.

- [ ] **Step 2: Confirm HMR works**

Save a trivial change to any renderer component. The window should hot-reload.

- [ ] **Step 3: Stop with Ctrl+C**

---

## Task 10: Production build verification

- [ ] **Step 1: Run electron:build**

```bash
pnpm --filter @reyogo/desktop run electron:build
```

Verify output:
```bash
ls packages/desktop/out/main/
ls packages/desktop/out/preload/
ls packages/desktop/out/renderer/
ls packages/desktop/out/main/db/migrations/
```

All four directories should have content.

- [ ] **Step 2: Run full workspace typecheck + test**

```bash
pnpm run typecheck && pnpm run test
```

Expected: all packages pass.

- [ ] **Step 3: Commit**

No files to commit — this is verification only.

---

## Task 11: Update CLAUDE.md

**Files:** `CLAUDE.md` (root)

- [ ] **Step 1: Update Commands and Architecture sections**

Update references from `dist/`, `dist-electron/`, `tsconfig.electron.json`, `concurrently` to reflect the new electron-vite setup. Update the TypeScript Config Split table.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for electron-vite migration

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Push and open PR

- [ ] **Step 1: Push**

```bash
git push -u origin feat/migrate-desktop-electron-vite
```

- [ ] **Step 2: Open PR**

```bash
gh pr create \
  --title "feat(desktop): migrate to electron-vite" \
  --body "$(cat <<'EOF'
## Summary

- Replaces the dual Vite config (renderer) + tsc (main/preload) setup with a single \`electron.vite.config.ts\` using electron-vite 2.x
- Removes \`concurrently\` and \`wait-on\` — \`electron-vite dev\` handles both renderer and main process with built-in HMR
- Removes \`tsconfig.electron.json\` and \`tsconfig.node.json\` — electron-vite handles main/preload transpilation via esbuild
- Output layout changes: \`dist/\` + \`dist-electron/\` → \`out/\` (main, preload, renderer subdirs)
- All 7 existing tests pass unchanged
- electron-builder packaging updated for new output layout

## Test plan

- [ ] \`pnpm --filter @reyogo/desktop run test\` — 7 tests pass
- [ ] \`pnpm run typecheck\` — all packages pass
- [ ] \`pnpm --filter @reyogo/desktop run dev\` — Electron window opens with HMR working
- [ ] \`pnpm --filter @reyogo/desktop run electron:build\` — out/ tree complete including migrations

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- ✅ electron-vite unified config replacing vite.config.ts + tsconfig.electron.json
- ✅ concurrently + wait-on removed
- ✅ Migrations copied via plugin (closeBundle hook)
- ✅ Preload path updated for new output layout
- ✅ electron-builder files/asarUnpack updated
- ✅ turbo.json outputs updated
- ✅ Existing 3 test files verified
- ✅ Dev smoke test
- ✅ Production build verification

**Key risk flagged by planning agent:** `electron-router-dom` dev mode connects to `http://localhost:5173`. electron-vite starts the renderer server before spawning Electron, so the port should be ready. If a blank window appears on first dev launch, add a short delay around `createWindow()` as a diagnostic.

**Type consistency:** `externalizeDepsPlugin` is imported from `electron-vite` (not from vite). All path aliases in `electron.vite.config.ts` match those in the existing `tsconfig.json`.
