# packages/ui — Design Spec

**Date:** 2026-05-10  
**Trello:** [#189 — [Monorepo] Scaffold packages/ui](https://trello.com/c/WmHJDErb/189-monorepo-scaffold-packages-ui)  
**Scope:** PR 1 of 2 — scaffold, migration, shadcn wiring, smoke tests. Ladle deferred to PR 2.

---

## Problem

shadcn/ui components are duplicated across the monorepo boundary. `apps/desktop` owns 14 components today; `apps/web` will need the same set. Without a shared package, every component fix or style change must be made twice and design consistency degrades over time.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Distribution | Raw TypeScript source | Both consumers run Vite — no pre-compilation needed. Same pattern as `packages/shared`. Avoids CSS extraction complexity. |
| Build step | None | `main` and `types` point directly at `src/index.ts`. |
| shadcn CLI target | `components.json` in `packages/ui` | Single owner. `shadcn add` always goes to the right place. |
| CSS tokens | Move to `packages/ui/src/globals.css` | Single source of truth. Each app entry point imports it. |
| Tailwind content | `node_modules/@reyogo/ui/src/**` path in shared preset | Scales correctly as the library grows. pnpm symlinks resolve to the monorepo source. |
| Tree-shaking | `"sideEffects": false` in package.json | Bundlers can safely drop unused components from app bundles. |
| Testing | Vitest + jsdom render smoke tests | One test per component — verifies it renders without throwing. |

---

## Package Structure

```
packages/ui/
  src/
    components/
      badge.tsx
      button.tsx
      calendar.tsx
      date-picker.tsx
      dialog.tsx
      input.tsx
      label.tsx
      popover.tsx
      select.tsx
      sidebar.tsx
      sonner.tsx
      spinner.tsx
      table.tsx
      tabs.tsx
      badge.test.tsx
      button.test.tsx
      ... (one test per component)
    lib/
      utils.ts          cn() helper
    globals.css         CSS variable token layer
    index.ts            barrel — re-exports every component + cn
  components.json       shadcn CLI config
  tsconfig.json         extends ../../tsconfig.base.json
  vitest.config.ts      jsdom environment
  package.json          @reyogo/ui, sideEffects: false, no build script
```

---

## package.json

```json
{
  "name": "@reyogo/ui",
  "version": "0.1.0",
  "private": true,
  "sideEffects": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "oxlint --config ../../packages/config/oxlint.json src/",
    "format": "oxfmt src/",
    "format:check": "oxfmt --check src/"
  }
}
```

Key dependencies (direct, pinned to match `apps/desktop`): `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, all `@radix-ui/*` packages currently in `apps/desktop`. `react` and `react-dom` are peer dependencies.

---

## tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "paths": {
      "@reyogo/ui/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@reyogo/ui/components",
    "utils": "@reyogo/ui/lib/utils",
    "ui": "@reyogo/ui/components",
    "lib": "@reyogo/ui/lib",
    "hooks": "@reyogo/ui/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## Tailwind Wiring

**`packages/config/tailwind.preset.ts`** — add to content:
```ts
content: ['./node_modules/@reyogo/ui/src/**/*.{ts,tsx}'],
```

This path is resolved via pnpm's symlink from each app's `node_modules/@reyogo/ui` → `../../packages/ui`. Tailwind's JIT follows symlinks and scans the source. Adding it to the preset means neither app needs its own `packages/ui` content entry.

---

## CSS Tokens

`packages/ui/src/globals.css` owns the full CSS variable layer (colours, radii, spacing).

Each app entry point:
```ts
// apps/desktop/src/renderer/src/main.tsx
import '@reyogo/ui/src/globals.css';  // replaces inline token block

// apps/web/src/main.tsx
import '@reyogo/ui/src/globals.css';
```

`apps/desktop/src/renderer/src/index.css` retains only the `@tailwind` directives.

---

## Testing

One smoke test per component using `@testing-library/react` + jsdom. Pattern:

```tsx
// src/components/button.test.tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders without error', () => {
    render(<Button>Click me</Button>);
  });
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom' },
});
```

---

## Consumer Changes

### `apps/desktop`
- Add `@reyogo/ui: workspace:*` to `package.json`
- Delete `src/renderer/src/components/ui/` (all 14 files)
- Delete `src/renderer/src/lib/utils.ts`
- Update all imports: `@/components/ui/button` → `@reyogo/ui`
- Update `index.css`: remove token block, add `@import '@reyogo/ui/src/globals.css'`
- Remove `components.json`
- Add `../../packages/ui/src/**` removed from content (now in preset)

### `apps/web`
- Add `@reyogo/ui: workspace:*` to `package.json`
- Add `@import '@reyogo/ui/src/globals.css'` to `src/index.css`

---

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC1 | `pnpm --filter @reyogo/ui run test` — all smoke tests pass |
| AC2 | `pnpm --filter @reyogo/ui run typecheck` — clean |
| AC3 | `pnpm --filter @reyogo/desktop run typecheck` — clean, no unresolved `@/components/ui` imports |
| AC4 | `pnpm --filter @reyogo/desktop run electron:build` — succeeds, UI renders correctly |
| AC5 | `pnpm --filter @reyogo/web run build` — succeeds |
| AC6 | `pnpm --filter @reyogo/ui exec shadcn add badge` — drops component into `packages/ui/src/components/` |

---

## Out of Scope (PR 2)

- Ladle component browser and stories
