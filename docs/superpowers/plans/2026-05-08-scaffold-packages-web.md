# Scaffold packages/web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold `packages/web` as `@reyogo/web` (React + Vite SPA consuming `@reyogo/shared`), then extract the shared Tailwind theme and Vite factory into `packages/config` so both desktop and web share them.

**Architecture:** `packages/web` is a standalone Vite + React SPA. `packages/config` grows to export a Tailwind preset (`tailwind.preset.ts`) and a Vite config factory (`vite.base.ts`). Both `packages/desktop` and `packages/web` consume these via `@reyogo/config/tailwind.preset` and `@reyogo/config/vite.base`. Consuming packages still own their own `content` globs, `resolve.alias`, and port settings — only the shared theme tokens and the `react()` plugin bootstrapping live in config.

**Tech Stack:** pnpm workspaces, Turborepo, Vite 5, React 18, Tailwind CSS 3, TypeScript 5, Vitest, @testing-library/react, oxlint, oxfmt

---

## File Map

### New files

| Path | Purpose |
|------|---------|
| `packages/web/package.json` | `@reyogo/web` manifest with scripts and deps |
| `packages/web/tsconfig.json` | Extends `tsconfig.base.json`, adds DOM lib and `jsx` |
| `packages/web/vite.config.ts` | Calls `createViteConfig()` from `@reyogo/config/vite.base` |
| `packages/web/tailwind.config.ts` | Uses `@reyogo/config/tailwind.preset` as a preset |
| `packages/web/postcss.config.ts` | Wires tailwindcss + autoprefixer |
| `packages/web/index.html` | Vite entry HTML |
| `packages/web/src/main.tsx` | React root mount |
| `packages/web/src/App.tsx` | Placeholder page, imports a type from `@reyogo/shared` |
| `packages/web/src/index.css` | CSS custom properties (design tokens) + Tailwind directives |
| `packages/web/src/App.test.tsx` | Vitest + @testing-library/react smoke test |
| `packages/config/tailwind.preset.ts` | Exported Tailwind preset (theme tokens + animate plugin) |
| `packages/config/vite.base.ts` | Exported `createViteConfig()` factory (wraps react plugin) |
| `packages/config/tsconfig.json` | Typecheck scope for the new .ts files in config |

### Modified files

| Path | Change |
|------|--------|
| `packages/config/package.json` | Add exports, dependencies, and scripts |
| `packages/desktop/tailwind.config.js` | Switch to `presets: [preset]` pattern |
| `packages/desktop/vite.config.ts` | Switch to `createViteConfig(overrides)` |
| `.github/workflows/ci.yml` | Add `build-web` job |

---

## Task 1: Pull main and create the feature worktree

**Files:** none (git operations only)

- [ ] **Step 1: Confirm PR #41 is merged, then pull main**

```bash
cd /Users/shane/Dev/ReYoGo
git checkout main && git pull origin main
```

Expected: fast-forward to latest main with the pnpm monorepo commits.

- [ ] **Step 2: Create a worktree for the new branch**

```bash
git worktree add .claude/worktrees/feat+scaffold-packages-web -b feat/scaffold-packages-web
```

Expected output: `Preparing worktree (new branch 'feat/scaffold-packages-web')`.

- [ ] **Step 3: Verify worktree has the monorepo structure**

```bash
ls /Users/shane/Dev/ReYoGo/.claude/worktrees/feat+scaffold-packages-web/packages/
```

Expected: `config  desktop  shared`

All remaining steps run from inside the worktree:
```bash
cd /Users/shane/Dev/ReYoGo/.claude/worktrees/feat+scaffold-packages-web
```

---

## Task 2: Scaffold packages/web — manifest and tsconfig

**Files:**
- Create: `packages/web/package.json`
- Create: `packages/web/tsconfig.json`

- [ ] **Step 1: Create `packages/web/package.json`**

```json
{
  "name": "@reyogo/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "lint": "oxlint --config ../../packages/config/oxlint.json src/",
    "format": "oxfmt src/",
    "format:check": "oxfmt --check src/"
  },
  "dependencies": {
    "@reyogo/shared": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@reyogo/config": "workspace:*",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^1.2.0",
    "autoprefixer": "^10.4.17",
    "jsdom": "^23.0.1",
    "oxlint": "^1.61.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "vitest": "^1.2.0"
  }
}
```

- [ ] **Step 2: Create `packages/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "tailwind.config.ts", "postcss.config.ts"]
}
```

- [ ] **Step 3: Install deps from workspace root**

```bash
pnpm install
```

Expected: lockfile updated, `packages/web/node_modules` populated (or hoisted).

---

## Task 3: Write the failing App test

**Files:**
- Create: `packages/web/src/App.test.tsx`

- [ ] **Step 1: Create the test file** (App.tsx doesn't exist yet — this will fail at import)

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the ReYoGo Web heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /reyogo web/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — confirm it fails on missing module**

```bash
pnpm --filter @reyogo/web run test
```

Expected: fails with `Cannot find module './App'` or similar. If it passes, something is wrong — stop and investigate.

---

## Task 4: Scaffold web entry points and implement App

**Files:**
- Create: `packages/web/index.html`
- Create: `packages/web/src/main.tsx`
- Create: `packages/web/src/App.tsx`
- Create: `packages/web/src/index.css`
- Create: `packages/web/vite.config.ts`
- Create: `packages/web/tailwind.config.ts`
- Create: `packages/web/postcss.config.ts`

> **Note:** `vite.config.ts` and `tailwind.config.ts` use direct imports here (no shared config yet). Tasks 5–10 will extract those into `packages/config` and swap the imports. This order makes it easy to verify the scaffold works before refactoring.

- [ ] **Step 1: Create `packages/web/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ReYoGo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `packages/web/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Create `packages/web/src/App.tsx`**

Import a type from `@reyogo/shared` to verify the workspace connection compiles.

```tsx
import type { IInventoryCategory } from '@reyogo/shared/inventory';

function App() {
  const _typeCheck: IInventoryCategory | undefined = undefined;
  void _typeCheck;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">ReYoGo Web</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Create `packages/web/src/index.css`**

Copy the design token CSS variables from the desktop's `index.css`. Read the full file at `packages/desktop/src/renderer/src/index.css` then create this file with the same content but change the `content` comment at the top:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.5rem;

    /* Warm Precision — Light SaaS */
    --background: #fafaf9;
    --foreground: #1c1917;

    --card: #ffffff;
    --card-foreground: #1c1917;

    --popover: #ffffff;
    --popover-foreground: #1c1917;

    --primary: #d97706;
    --primary-foreground: #ffffff;

    --secondary: #f5f5f4;
    --secondary-foreground: #1c1917;

    --muted: #f5f5f4;
    --muted-foreground: #78716c;

    --accent: #fef3c7;
    --accent-foreground: #92400e;

    --destructive: #dc2626;
    --destructive-foreground: #ffffff;

    --border: #e7e5e4;
    --input: #e7e5e4;
    --ring: #d97706;

    --chart-1: #d97706;
    --chart-2: #0ea5e9;
    --chart-3: #10b981;
    --chart-4: #8b5cf6;
    --chart-5: #f43f5e;
  }

  .dark {
    --background: #1c1917;
    --foreground: #fafaf9;

    --card: #292524;
    --card-foreground: #fafaf9;

    --popover: #292524;
    --popover-foreground: #fafaf9;

    --primary: #f59e0b;
    --primary-foreground: #1c1917;

    --secondary: #292524;
    --secondary-foreground: #fafaf9;

    --muted: #292524;
    --muted-foreground: #a8a29e;

    --accent: #451a03;
    --accent-foreground: #fef3c7;

    --destructive: #ef4444;
    --destructive-foreground: #ffffff;

    --border: #3f3937;
    --input: #3f3937;
    --ring: #f59e0b;

    --chart-1: #f59e0b;
    --chart-2: #38bdf8;
    --chart-3: #34d399;
    --chart-4: #a78bfa;
    --chart-5: #fb7185;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

> **Note:** If the desktop's `index.css` has additional dark-mode variables or sidebar tokens, copy them too. Read the full file to confirm before saving.

- [ ] **Step 5: Create `packages/web/vite.config.ts`** (inline, pre-extraction)

```ts
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
```

- [ ] **Step 6: Create `packages/web/src/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create `packages/web/tailwind.config.ts`** (inline, pre-extraction)

```ts
import tailwindcssAnimate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
```

- [ ] **Step 8: Create `packages/web/postcss.config.ts`**

```ts
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 9: Run test — confirm it passes**

```bash
pnpm --filter @reyogo/web run test
```

Expected: `✓ App > renders the ReYoGo Web heading`. If it fails, read the error and fix before continuing.

- [ ] **Step 10: Run typecheck**

```bash
pnpm --filter @reyogo/web run typecheck
```

Expected: exits 0 with no errors.

- [ ] **Step 11: Commit the scaffold**

```bash
git add packages/web/
git commit -m "feat(web): scaffold @reyogo/web — React + Vite SPA

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Extract Tailwind preset into packages/config

**Files:**
- Create: `packages/config/tailwind.preset.ts`
- Create: `packages/config/tsconfig.json`
- Modify: `packages/config/package.json`

- [ ] **Step 1: Create `packages/config/tailwind.preset.ts`**

This is the exact same `theme.extend` block from the desktop's `tailwind.config.js` plus the animate plugin, wrapped as a Tailwind preset. Consuming packages use `presets: [preset]` and add their own `content` globs.

```ts
import tailwindcssAnimate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default preset;
```

- [ ] **Step 2: Create `packages/config/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"]
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 3: Update `packages/config/package.json`**

Replace the current content entirely:

```json
{
  "name": "@reyogo/config",
  "version": "0.1.0",
  "private": true,
  "description": "Shared lint, format, Tailwind, and Vite config for the reyogo monorepo",
  "exports": {
    "./oxlint": "./oxlint.json",
    "./tailwind.preset": "./tailwind.preset.ts",
    "./vite.base": "./vite.base.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "oxlint --config ./oxlint.json *.ts",
    "format": "oxfmt *.ts",
    "format:check": "oxfmt --check *.ts"
  },
  "dependencies": {
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "oxlint": "^1.61.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

- [ ] **Step 4: Install to pick up new config deps**

```bash
pnpm install
```

Expected: `tailwindcss-animate` installed as a dep of `@reyogo/config`.

- [ ] **Step 5: Typecheck config package**

```bash
pnpm --filter @reyogo/config run typecheck
```

Expected: exits 0.

---

## Task 6: Wire packages/desktop to use the Tailwind preset

**Files:**
- Modify: `packages/desktop/tailwind.config.js`

- [ ] **Step 1: Replace `packages/desktop/tailwind.config.js`**

Remove the inline `theme.extend` and `plugins` array — pull them from the preset instead.

```js
import preset from '@reyogo/config/tailwind.preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
  ],
};
```

- [ ] **Step 2: Typecheck desktop**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

Expected: exits 0. If there are type errors about the preset import, check that `@reyogo/config` is in desktop's devDependencies:

```bash
cat packages/desktop/package.json | grep '@reyogo/config'
```

If missing, add `"@reyogo/config": "workspace:*"` to `packages/desktop/devDependencies` and re-run `pnpm install`.

- [ ] **Step 3: Verify desktop still builds**

```bash
pnpm --filter @reyogo/desktop run build
```

Expected: build completes with no CSS errors.

---

## Task 7: Wire packages/web to use the Tailwind preset

**Files:**
- Modify: `packages/web/tailwind.config.ts`

- [ ] **Step 1: Replace `packages/web/tailwind.config.ts`** with the preset-based version

```ts
import preset from '@reyogo/config/tailwind.preset';
import type { Config } from 'tailwindcss';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
```

- [ ] **Step 2: Typecheck web**

```bash
pnpm --filter @reyogo/web run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Run web tests to confirm nothing regressed**

```bash
pnpm --filter @reyogo/web run test
```

Expected: all tests pass.

- [ ] **Step 4: Commit the Tailwind extraction**

```bash
git add packages/config/ packages/desktop/tailwind.config.js packages/web/tailwind.config.ts
git commit -m "feat(config): extract shared Tailwind preset to @reyogo/config

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Extract Vite base config into packages/config

**Files:**
- Create: `packages/config/vite.base.ts`

- [ ] **Step 1: Create `packages/config/vite.base.ts`**

A factory that wraps `@vitejs/plugin-react` and merges caller-supplied overrides. Consumers pass only what's specific to their package (root, alias, port, outDir).

```ts
import react from '@vitejs/plugin-react';
import { mergeConfig, defineConfig, type UserConfig } from 'vite';

const base: UserConfig = {
  plugins: [react()],
};

export function createViteConfig(overrides: UserConfig = {}): UserConfig {
  return mergeConfig(defineConfig(base), defineConfig(overrides));
}
```

- [ ] **Step 2: Typecheck config package**

```bash
pnpm --filter @reyogo/config run typecheck
```

Expected: exits 0.

---

## Task 9: Wire packages/desktop to use createViteConfig

**Files:**
- Modify: `packages/desktop/vite.config.ts`

- [ ] **Step 1: Replace `packages/desktop/vite.config.ts`**

```ts
import { createViteConfig } from '@reyogo/config/vite.base';
import { resolve } from 'path';

export default createViteConfig({
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
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
});
```

- [ ] **Step 2: Typecheck desktop**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Verify desktop build**

```bash
pnpm --filter @reyogo/desktop run build
```

Expected: build completes. The Electron renderer bundle lands in `packages/desktop/dist/`.

---

## Task 10: Wire packages/web to use createViteConfig

**Files:**
- Modify: `packages/web/vite.config.ts`

- [ ] **Step 1: Replace `packages/web/vite.config.ts`**

```ts
import { createViteConfig } from '@reyogo/config/vite.base';
import { resolve } from 'path';

export default createViteConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
```

- [ ] **Step 2: Typecheck web**

```bash
pnpm --filter @reyogo/web run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Run web tests**

```bash
pnpm --filter @reyogo/web run test
```

Expected: all tests pass.

- [ ] **Step 4: Commit the Vite extraction**

```bash
git add packages/config/vite.base.ts packages/desktop/vite.config.ts packages/web/vite.config.ts
git commit -m "feat(config): extract shared Vite config factory to @reyogo/config

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Full workspace verification

- [ ] **Step 1: Typecheck all packages**

```bash
pnpm run typecheck
```

Expected: all packages exit 0. Turbo will fan out to `@reyogo/config`, `@reyogo/shared`, `@reyogo/desktop`, `@reyogo/web`.

- [ ] **Step 2: Lint all packages**

```bash
pnpm run lint
```

Expected: no lint errors.

- [ ] **Step 3: Run all tests**

```bash
pnpm run test
```

Expected: desktop tests pass, web tests pass, shared has no tests (skipped).

---

## Task 12: Add build-web job to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

The CI already runs `pnpm run lint`, `pnpm run typecheck`, and `pnpm run test` globally via Turbo (which fans out to all packages including web). The only missing piece is a Vite production build check for `@reyogo/web` to mirror the `build-desktop` job.

- [ ] **Step 1: Add `build-web` job to `.github/workflows/ci.yml`**

Append after the `build-desktop` job:

```yaml
  build-web:
    needs: [ lint, test, typecheck ]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - run: pnpm --filter @reyogo/web run build
```

- [ ] **Step 2: Enable `build-web` as a required check**

In GitHub → Settings → Branches → main → Protection rules → Required status checks, add `build-web`. Do this after the PR is open so the job name is known to GitHub.

- [ ] **Step 3: Commit the CI change**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add build-web job for @reyogo/web Vite production build

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Push and open PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/scaffold-packages-web
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create \
  --title "feat: scaffold @reyogo/web and extract shared config to @reyogo/config" \
  --body "$(cat <<'EOF'
## Summary

- Scaffolds `packages/web` as `@reyogo/web` — a React 18 + Vite 5 SPA consuming `@reyogo/shared` for entity types
- Extracts the shared Tailwind theme preset into `packages/config/tailwind.preset.ts`; both desktop and web use `presets: [preset]`
- Extracts a `createViteConfig()` factory into `packages/config/vite.base.ts`; both desktop and web wrap it with their own overrides
- Adds `build-web` CI job to verify the Vite production build on every PR

## Test plan

- [ ] `pnpm run typecheck` passes for all packages
- [ ] `pnpm run test` passes (desktop + web)
- [ ] `pnpm run lint` passes for all packages
- [ ] `pnpm --filter @reyogo/desktop run build` produces a desktop bundle
- [ ] `pnpm --filter @reyogo/web run build` produces a web bundle in `packages/web/dist/`
- [ ] CI green on all required checks

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Pull main after PR merges — Task 1
- ✅ Create worktree for `feat/scaffold-packages-web` — Task 1
- ✅ Scaffold `packages/web` as `@reyogo/web` (React + Vite) — Tasks 2–4
- ✅ Consume `@reyogo/shared` — App.tsx imports `IInventoryCategory`
- ✅ Extract shared Tailwind preset to `packages/config` — Tasks 5–7
- ✅ Extract shared Vite base config to `packages/config` — Tasks 8–10
- ✅ CI wired for web — Task 12

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" references found.

**Type consistency:**
- `createViteConfig` defined in Task 8, used in Tasks 9 and 10 — matches.
- `preset` exported as default from `tailwind.preset.ts`, consumed via `import preset from '@reyogo/config/tailwind.preset'` in Tasks 6 and 7 — matches.
- `IInventoryCategory` imported in App.tsx — this type exists in `packages/shared/src/inventory/index.ts` (established in PR #41).
