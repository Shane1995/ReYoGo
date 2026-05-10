# packages/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `packages/ui` as the shared React component library, migrate the 14 existing shadcn/ui components from `apps/desktop`, point the shadcn CLI at the new package, and update all consumers.

**Architecture:** Raw TypeScript source — no build step. `packages/ui` exports components directly from `src/index.ts`; Vite in each consuming app compiles them. CSS tokens move to `packages/ui/src/globals.css`. Tailwind content scanning moved into the shared preset via the `node_modules/@reyogo/ui` path.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, shadcn/ui (new-york style), Radix UI, Vitest + jsdom, `@testing-library/react`

---

## File Map

**Created:**
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/vitest.config.ts`
- `packages/ui/components.json`
- `packages/ui/src/index.ts`
- `packages/ui/src/lib/utils.ts`
- `packages/ui/src/globals.css`
- `packages/ui/src/components/badge.tsx` + `badge.test.tsx`
- `packages/ui/src/components/button.tsx` + `button.test.tsx`
- `packages/ui/src/components/calendar.tsx` + `calendar.test.tsx`
- `packages/ui/src/components/date-picker.tsx` + `date-picker.test.tsx`
- `packages/ui/src/components/dialog.tsx` + `dialog.test.tsx`
- `packages/ui/src/components/input.tsx` + `input.test.tsx`
- `packages/ui/src/components/label.tsx` + `label.test.tsx`
- `packages/ui/src/components/popover.tsx` + `popover.test.tsx`
- `packages/ui/src/components/select.tsx` + `select.test.tsx`
- `packages/ui/src/components/sidebar.tsx` + `sidebar.test.tsx`
- `packages/ui/src/components/sonner.tsx` + `sonner.test.tsx`
- `packages/ui/src/components/spinner.tsx` + `spinner.test.tsx`
- `packages/ui/src/components/table.tsx` + `table.test.tsx`
- `packages/ui/src/components/tabs.tsx` + `tabs.test.tsx`

**Modified:**
- `packages/config/tailwind.preset.ts` — add `node_modules/@reyogo/ui` content path
- `apps/desktop/package.json` — add `@reyogo/ui workspace:*`, remove migrated UI deps
- `apps/desktop/tailwind.config.js` — remove `packages/ui` content (now in preset)
- `apps/desktop/src/renderer/src/index.css` — replace token block with `@import`
- `apps/desktop/src/renderer/src/main.tsx` — add `@reyogo/ui/src/globals.css` import
- All 69 desktop files importing from `@/components/ui/*` or `@/lib/utils`
- `apps/web/package.json` — add `@reyogo/ui workspace:*`
- `apps/web/src/index.css` — add `@import`
- `apps/web/src/main.tsx` — add globals import

**Deleted:**
- `apps/desktop/src/renderer/src/components/ui/` (14 files)
- `apps/desktop/src/renderer/src/lib/utils.ts`
- `apps/desktop/components.json`

---

## Task 1: Scaffold packages/ui

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/vitest.config.ts`

- [ ] **Step 1: Create `packages/ui/package.json`**

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
  },
  "peerDependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.460.0",
    "react-day-picker": "^9.14.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^16.3.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "jsdom": "^26.1.0",
    "oxlint": "^1.63.0",
    "typescript": "^5.3.3",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@reyogo/ui/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/ui/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
```

- [ ] **Step 4: Create `packages/ui/src/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Install dependencies**

Run from the repo root:
```bash
pnpm install
```

Expected: pnpm resolves `@reyogo/ui` in the workspace and installs its deps.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/
git commit -m "chore(ui): scaffold packages/ui package"
```

---

## Task 2: Add globals.css and utils.ts

**Files:**
- Create: `packages/ui/src/globals.css`
- Create: `packages/ui/src/lib/utils.ts`

- [ ] **Step 1: Create `packages/ui/src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create `packages/ui/src/globals.css`**

Move the full `@layer base` block from `apps/desktop/src/renderer/src/index.css`. The file should contain everything from `@layer base {` through the closing `}`, plus the keyframes and custom classes at the bottom. Do NOT include the `@tailwind base/components/utilities` directives — those stay in each app's CSS file.

```css
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
    --nav-bg: #ffffff;
    --nav-border: #e7e5e4;
    --nav-foreground: #1c1917;
    --nav-foreground-muted: #78716c;
    --nav-accent: #fef3c7;
    --nav-accent-foreground: #92400e;
    --nav-active-border: #d97706;
    --nav-tab-active-bg: #d97706;
    --nav-tab-active-fg: #ffffff;
    --content-tint: #f5f5f4;
    --sidebar: #ffffff;
    --sidebar-foreground: #1c1917;
    --sidebar-primary: #d97706;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #fef3c7;
    --sidebar-accent-foreground: #92400e;
    --sidebar-border: #e7e5e4;
    --sidebar-ring: #d97706;
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
    --accent: #44403c;
    --accent-foreground: #fafaf9;
    --destructive: #ef4444;
    --destructive-foreground: #fafaf9;
    --border: #44403c;
    --input: #44403c;
    --ring: #f59e0b;
    --chart-1: #f59e0b;
    --chart-2: #38bdf8;
    --chart-3: #34d399;
    --chart-4: #a78bfa;
    --chart-5: #fb7185;
    --nav-bg: #1c1917;
    --nav-border: #44403c;
    --nav-foreground: #fafaf9;
    --nav-foreground-muted: #a8a29e;
    --nav-accent: #44403c;
    --nav-accent-foreground: #fafaf9;
    --nav-active-border: #f59e0b;
    --nav-tab-active-bg: #f59e0b;
    --nav-tab-active-fg: #1c1917;
    --content-tint: #1c1917;
    --sidebar: #1c1917;
    --sidebar-foreground: #fafaf9;
    --sidebar-primary: #f59e0b;
    --sidebar-primary-foreground: #1c1917;
    --sidebar-accent: #44403c;
    --sidebar-accent-foreground: #fafaf9;
    --sidebar-border: #44403c;
    --sidebar-ring: #f59e0b;
  }

  * {
    border-color: var(--border);
    scrollbar-width: none;
  }

  *::-webkit-scrollbar {
    display: none;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  button:not(:disabled),
  [role='button']:not(:disabled) {
    cursor: pointer;
  }

  .tabular-nums,
  td,
  th {
    font-variant-numeric: tabular-nums;
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

- [ ] **Step 3: Create a placeholder `packages/ui/src/index.ts`**

This will be filled out in Task 4. For now just export utils so typecheck passes:

```ts
export { cn } from './lib/utils';
```

- [ ] **Step 4: Run typecheck to verify clean**

```bash
pnpm --filter @reyogo/ui run typecheck
```

Expected: clean exit.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/
git commit -m "chore(ui): add globals.css token layer and cn utility"
```

---

## Task 3: Migrate the 14 components

**Files:**
- Create: `packages/ui/src/components/*.tsx` (14 files)
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Copy all 14 component files**

```bash
cp apps/desktop/src/renderer/src/components/ui/badge.tsx packages/ui/src/components/badge.tsx
cp apps/desktop/src/renderer/src/components/ui/button.tsx packages/ui/src/components/button.tsx
cp apps/desktop/src/renderer/src/components/ui/calendar.tsx packages/ui/src/components/calendar.tsx
cp apps/desktop/src/renderer/src/components/ui/date-picker.tsx packages/ui/src/components/date-picker.tsx
cp apps/desktop/src/renderer/src/components/ui/dialog.tsx packages/ui/src/components/dialog.tsx
cp apps/desktop/src/renderer/src/components/ui/input.tsx packages/ui/src/components/input.tsx
cp apps/desktop/src/renderer/src/components/ui/label.tsx packages/ui/src/components/label.tsx
cp apps/desktop/src/renderer/src/components/ui/popover.tsx packages/ui/src/components/popover.tsx
cp apps/desktop/src/renderer/src/components/ui/select.tsx packages/ui/src/components/select.tsx
cp apps/desktop/src/renderer/src/components/ui/sidebar.tsx packages/ui/src/components/sidebar.tsx
cp apps/desktop/src/renderer/src/components/ui/sonner.tsx packages/ui/src/components/sonner.tsx
cp apps/desktop/src/renderer/src/components/ui/spinner.tsx packages/ui/src/components/spinner.tsx
cp apps/desktop/src/renderer/src/components/ui/table.tsx packages/ui/src/components/table.tsx
cp apps/desktop/src/renderer/src/components/ui/tabs.tsx packages/ui/src/components/tabs.tsx
```

- [ ] **Step 2: Update imports inside the copied components**

Each component currently imports `cn` from `@/lib/utils`. Change to the local utils path:

```bash
find packages/ui/src/components -name "*.tsx" -exec \
  sed -i '' "s|from '@/lib/utils'|from '../lib/utils'|g" {} \;
```

Verify no `@/` paths remain:
```bash
grep -r "@/" packages/ui/src/components/
```
Expected: no output.

- [ ] **Step 3: Update `packages/ui/src/index.ts` with full barrel export**

```ts
export { cn } from './lib/utils';
export * from './components/badge';
export * from './components/button';
export * from './components/calendar';
export * from './components/date-picker';
export * from './components/dialog';
export * from './components/input';
export * from './components/label';
export * from './components/popover';
export * from './components/select';
export * from './components/sidebar';
export * from './components/sonner';
export * from './components/spinner';
export * from './components/table';
export * from './components/tabs';
```

- [ ] **Step 4: Run typecheck**

```bash
pnpm --filter @reyogo/ui run typecheck
```

Expected: clean exit. If there are errors, they will be in the component files — check that all Radix UI imports resolve correctly (they should, since they're in `dependencies`).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/
git commit -m "feat(ui): migrate 14 shadcn components from apps/desktop"
```

---

## Task 4: Write smoke tests for all 14 components

**Files:**
- Create: `packages/ui/src/components/*.test.tsx` (14 files)

- [ ] **Step 1: Write `packages/ui/src/components/badge.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders without error', () => {
    render(<Badge>New</Badge>);
  });
});
```

- [ ] **Step 2: Write `packages/ui/src/components/button.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders without error', () => {
    render(<Button>Click me</Button>);
  });
});
```

- [ ] **Step 3: Write `packages/ui/src/components/input.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders without error', () => {
    render(<Input placeholder="Type here" />);
  });
});
```

- [ ] **Step 4: Write `packages/ui/src/components/label.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('renders without error', () => {
    render(<Label>Name</Label>);
  });
});
```

- [ ] **Step 5: Write `packages/ui/src/components/dialog.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

describe('Dialog', () => {
  it('renders without error', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
  });
});
```

- [ ] **Step 6: Write `packages/ui/src/components/popover.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

describe('Popover', () => {
  it('renders without error', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );
  });
});
```

- [ ] **Step 7: Write `packages/ui/src/components/select.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
  it('renders without error', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>,
    );
  });
});
```

- [ ] **Step 8: Write `packages/ui/src/components/tabs.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('Tabs', () => {
  it('renders without error', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
      </Tabs>,
    );
  });
});
```

- [ ] **Step 9: Write `packages/ui/src/components/table.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table', () => {
  it('renders without error', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
  });
});
```

- [ ] **Step 10: Write `packages/ui/src/components/spinner.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders without error', () => {
    render(<Spinner />);
  });
});
```

- [ ] **Step 11: Write `packages/ui/src/components/sonner.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Toaster } from './sonner';

describe('Toaster', () => {
  it('renders without error', () => {
    render(<Toaster />);
  });
});
```

- [ ] **Step 12: Write `packages/ui/src/components/calendar.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders without error', () => {
    render(<Calendar mode="single" />);
  });
});
```

- [ ] **Step 13: Write `packages/ui/src/components/date-picker.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  it('renders without error', () => {
    render(<DatePicker />);
  });
});
```

- [ ] **Step 14: Write `packages/ui/src/components/sidebar.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { SidebarProvider } from './sidebar';

describe('SidebarProvider', () => {
  it('renders without error', () => {
    render(<SidebarProvider>{null}</SidebarProvider>);
  });
});
```

- [ ] **Step 15: Run all tests**

```bash
pnpm --filter @reyogo/ui run test
```

Expected: 14 test files, all passing.

- [ ] **Step 16: Commit**

```bash
git add packages/ui/src/components/
git commit -m "test(ui): add render smoke tests for all 14 components"
```

---

## Task 5: Add components.json and verify shadcn CLI

**Files:**
- Create: `packages/ui/components.json`

- [ ] **Step 1: Create `packages/ui/components.json`**

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

- [ ] **Step 2: Verify `shadcn add` targets the right location**

```bash
pnpm --filter @reyogo/ui exec shadcn add badge --overwrite
```

Expected: shadcn overwrites `packages/ui/src/components/badge.tsx` (no new file in apps/).

- [ ] **Step 3: Commit**

```bash
git add packages/ui/components.json
git commit -m "chore(ui): add components.json — shadcn CLI points to packages/ui"
```

---

## Task 6: Update Tailwind preset

**Files:**
- Modify: `packages/config/tailwind.preset.ts`

- [ ] **Step 1: Read current `packages/config/tailwind.preset.ts`**

The file exports a `preset` object with a `theme.extend` block and `plugins: [tailwindcssAnimate]`. It has no `content` array today.

- [ ] **Step 2: Add content path to preset**

Update `packages/config/tailwind.preset.ts`:

```ts
import tailwindcssAnimate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  content: ['./node_modules/@reyogo/ui/src/**/*.{ts,tsx}'],
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

- [ ] **Step 3: Run typecheck on config**

```bash
pnpm --filter @reyogo/config run typecheck
```

Expected: clean exit.

- [ ] **Step 4: Commit**

```bash
git add packages/config/tailwind.preset.ts
git commit -m "chore(config): add @reyogo/ui content path to Tailwind preset"
```

---

## Task 7: Update apps/desktop

**Files:**
- Modify: `apps/desktop/package.json`
- Modify: `apps/desktop/tailwind.config.js`
- Modify: `apps/desktop/src/renderer/src/index.css`
- Modify: `apps/desktop/src/renderer/src/main.tsx`
- Modify: 69 files importing from `@/components/ui/*` or `@/lib/utils`
- Delete: `apps/desktop/src/renderer/src/components/ui/` (14 files)
- Delete: `apps/desktop/src/renderer/src/lib/utils.ts`
- Delete: `apps/desktop/components.json`

- [ ] **Step 1: Add `@reyogo/ui` to `apps/desktop/package.json`**

In the `dependencies` section, add:
```json
"@reyogo/ui": "workspace:*"
```

Also remove the deps that are now owned by `packages/ui` (they'll resolve transitively):
Remove from `apps/desktop/package.json` dependencies:
- `@radix-ui/react-dialog`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `react-day-picker`
- `sonner`
- `tailwind-merge`

- [ ] **Step 2: Run `pnpm install`**

```bash
pnpm install
```

Expected: workspace resolves `@reyogo/ui` and its deps.

- [ ] **Step 3: Bulk update imports — `@/components/ui/*` → `@reyogo/ui`**

Run from the repo root:
```bash
find apps/desktop/src -name "*.tsx" -o -name "*.ts" | xargs \
  sed -i '' "s|from '@/components/ui/[a-z-]*'|from '@reyogo/ui'|g"
```

- [ ] **Step 4: Bulk update imports — `@/lib/utils` → `@reyogo/ui`**

```bash
find apps/desktop/src -name "*.tsx" -o -name "*.ts" | xargs \
  sed -i '' "s|from '@/lib/utils'|from '@reyogo/ui'|g"
```

- [ ] **Step 5: Verify no stale `@/components/ui` or `@/lib/utils` imports remain**

```bash
grep -r "@/components/ui\|@/lib/utils" apps/desktop/src/
```

Expected: no output.

- [ ] **Step 6: Update `apps/desktop/src/renderer/src/index.css`**

Replace the entire `@layer base { ... }` block and the keyframes/custom class section at the bottom with a single import. The file should become:

```css
/* stylelint-disable-next-line at-rule-no-unknown */
@tailwind base;
/* stylelint-disable-next-line at-rule-no-unknown */
@tailwind components;
/* stylelint-disable-next-line at-rule-no-unknown */
@tailwind utilities;
```

- [ ] **Step 7: Import globals in `apps/desktop/src/renderer/src/main.tsx`**

Add this import at the top of the file (after any existing imports, before the app render):

```ts
import '@reyogo/ui/src/globals.css';
```

The file currently imports `./index.css` — keep that, just add the globals import before it so tokens are defined before Tailwind utilities.

- [ ] **Step 8: Update `apps/desktop/tailwind.config.js`**

The `packages/ui` content is now covered by the preset. Remove any explicit `packages/ui` path if you added one earlier. The file should remain:

```js
import preset from '@reyogo/config/tailwind.preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
};
```

- [ ] **Step 9: Delete the migrated files**

```bash
rm -rf apps/desktop/src/renderer/src/components/ui/
rm apps/desktop/src/renderer/src/lib/utils.ts
rm apps/desktop/components.json
```

- [ ] **Step 10: Run typecheck on desktop**

```bash
pnpm --filter @reyogo/desktop run typecheck
```

Expected: clean exit. If there are unresolved imports, grep for remaining `@/components/ui` paths and fix manually.

- [ ] **Step 11: Run desktop build**

```bash
pnpm --filter @reyogo/desktop run electron:build
```

Expected: builds successfully.

- [ ] **Step 12: Commit**

```bash
git add apps/desktop/
git commit -m "chore(desktop): migrate UI components to @reyogo/ui"
```

---

## Task 8: Wire up apps/web

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Add `@reyogo/ui` to `apps/web/package.json` dependencies**

```json
"@reyogo/ui": "workspace:*"
```

- [ ] **Step 2: Run `pnpm install`**

```bash
pnpm install
```

- [ ] **Step 3: Import globals in `apps/web/src/main.tsx`**

Add at the top of the imports:
```ts
import '@reyogo/ui/src/globals.css';
```

- [ ] **Step 4: Update `apps/web/src/index.css`**

Remove any CSS variable token block if one exists (web had none). The file should only contain Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Run typecheck on web**

```bash
pnpm --filter @reyogo/web run typecheck
```

Expected: clean exit.

- [ ] **Step 6: Run web build**

```bash
pnpm --filter @reyogo/web run build
```

Expected: builds successfully.

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "chore(web): wire up @reyogo/ui and shared token layer"
```

---

## Task 9: Full verification and PR

- [ ] **Step 1: Run full workspace typecheck**

```bash
pnpm turbo run typecheck
```

Expected: all 6 packages clean.

- [ ] **Step 2: Run full workspace tests**

```bash
pnpm turbo run test
```

Expected: all tests passing including the 14 new smoke tests in `@reyogo/ui`.

- [ ] **Step 3: Run full workspace lint**

```bash
pnpm turbo run lint
```

Expected: 0 warnings, 0 errors across all packages.

- [ ] **Step 4: Raise PR**

```bash
git push -u origin <branch>
gh pr create --title "feat: scaffold packages/ui and migrate shadcn components" \
  --body "..."
```

The PR description should reference Trello card [#189](https://trello.com/c/WmHJDErb/189-monorepo-scaffold-packages-ui) and list the 6 ACs from the design spec.
