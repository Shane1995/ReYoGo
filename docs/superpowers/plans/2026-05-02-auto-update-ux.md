# Auto-Update UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the OS system notification auto-update with an in-app experience — silent download, persistent dismissible "Restart to apply" sonner toast when ready.

**Architecture:** Main process listens to `autoUpdater` events and pushes `app:update-downloaded` to the renderer via `webContents.send`. The renderer registers a named listener via preload, exposes it through `appService`, manages state in a `useAutoUpdater` hook, and fires a persistent sonner toast from an `UpdateToast` component mounted in `AppLayout`.

**Tech Stack:** electron-updater, Electron IPC, React, sonner, Vitest + @testing-library/react.

---

### Task 1: Add INSTALL_UPDATE to shared IPC types

**Files:**
- Modify: `src/shared/types/ipc/app.ts`
- Modify: `src/shared/types/ipc/invoke-map.ts`

- [ ] **Step 1: Add INSTALL_UPDATE channel to AppIPC enum**

Replace `src/shared/types/ipc/app.ts` with:

```typescript
export enum AppIPC {
  GET_VERSION = 'app:get-version',
  INSTALL_UPDATE = 'app:install-update',
}
```

- [ ] **Step 2: Add install-update entry to IPCInvokeMap**

In `src/shared/types/ipc/invoke-map.ts`, replace the `IPCInvokeMap` interface with:

```typescript
export interface IPCInvokeMap {
  'app:get-version': { args: []; return: AppVersionInfo };
  'app:install-update': { args: []; return: void };
  'inventory:get-categories': { args: []; return: IInventoryCategory[] };
  'inventory:get-items': { args: []; return: IInventoryItem[] };
  'inventory:upsert-category': { args: [category: IInventoryCategory]; return: void };
  'inventory:upsert-item': { args: [item: IInventoryItem]; return: void };
  'inventory:delete-category': { args: [id: string]; return: void };
  'inventory:delete-item': { args: [id: string]; return: void };
  'inventory:submit': { args: [payload: IInventorySubmitPayload]; return: void };
  'invoices:save-invoice': { args: [payload: ISaveCapturedInvoicePayload]; return: void };
  'invoices:get-invoices': { args: []; return: ICapturedInvoice[] };
  'invoices:get-invoices-with-lines': { args: []; return: ICapturedInvoiceWithLines[] };
  'invoices:get-invoice': { args: [id: string]; return: ICapturedInvoiceWithLines | null };
  'invoices:get-lines-for-analysis': { args: []; return: IInvoiceLineWithDate[] };
  'invoices:update-invoice': { args: [payload: IUpdateCapturedInvoicePayload]; return: void };
  'invoices:get-invoice-audit': { args: [id: string]; return: ICapturedInvoiceAuditEntry[] };
  'invoices:get-last-unit-prices': { args: []; return: Record<string, number> };
  'stock-movements:get-current-stock': { args: []; return: Record<string, number> };
  'stock-movements:get-weighted-avg-costs': { args: []; return: Record<string, number | null> };
  'stock-movements:get-item-cost-history': { args: [itemId: string]; return: IItemCostHistory };
  'stock-movements:get-cogs': { args: [fromDate?: string, toDate?: string]; return: ICOGSSummary };
  'setup:get-status': { args: []; return: ISetupStatus };
  'setup:complete': { args: []; return: void };
  'setup:get-units': { args: []; return: IUnitOfMeasure[] };
  'setup:upsert-unit': { args: [unit: IUnitOfMeasure]; return: void };
  'setup:delete-unit': { args: [id: string]; return: void };
  'setup:get-good-types': { args: []; return: string[] };
  'setup:set-good-types': { args: [types: string[]]; return: void };
}
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/types/ipc/app.ts src/shared/types/ipc/invoke-map.ts
git commit -m "feat: add INSTALL_UPDATE IPC channel"
```

---

### Task 2: Expose onUpdateDownloaded in preload

**Files:**
- Modify: `src/main/preload.ts`

- [ ] **Step 1: Add onUpdateDownloaded to preload**

Replace `src/main/preload.ts` with:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

const DB_READY_CHANNEL = 'db:ready';
const DB_REQUEST_READY_CHANNEL = 'db:request-ready';
const UPDATE_DOWNLOADED_CHANNEL = 'app:update-downloaded';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  },
  onAppReady: (callback: () => void) => {
    ipcRenderer.once(DB_READY_CHANNEL, callback);
  },
  requestAppReady: () => {
    ipcRenderer.send(DB_REQUEST_READY_CHANNEL);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on(UPDATE_DOWNLOADED_CHANNEL, callback);
  },
});
```

- [ ] **Step 2: Verify TypeScript is clean**

```bash
npx tsc --noEmit && npx tsc -p tsconfig.electron.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main/preload.ts
git commit -m "feat: expose onUpdateDownloaded in preload"
```

---

### Task 3: Update main handler and main.ts

**Files:**
- Modify: `src/main/handlers/app/index.ts`
- Modify: `src/main/main.ts`

- [ ] **Step 1: Update handlers/app/index.ts**

Replace `src/main/handlers/app/index.ts` with:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { AppIPC } from '../../../shared/types/ipc';

interface AppVersionInfo {
  version: string;
  env: string;
}

function getVersion(): AppVersionInfo {
  return {
    version: app.getVersion(),
    env: process.env.VITE_APP_ENV ?? 'development',
  };
}

export function registerAppHandlers(): void {
  ipcMain.handle(AppIPC.GET_VERSION, getVersion);
  ipcMain.handle(AppIPC.INSTALL_UPDATE, () => autoUpdater.quitAndInstall());

  autoUpdater.on('update-downloaded', () => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('app:update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater]', err);
  });
}
```

- [ ] **Step 2: Replace checkForUpdatesAndNotify with checkForUpdates in main.ts**

In `src/main/main.ts`, change:

```typescript
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
```

to:

```typescript
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
npx tsc --noEmit && npx tsc -p tsconfig.electron.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/main/handlers/app/index.ts src/main/main.ts
git commit -m "feat: wire autoUpdater events in main handler"
```

---

### Task 4: Add onUpdateDownloaded and installUpdate to app service

**Files:**
- Modify: `src/renderer/src/services/app/index.ts`

- [ ] **Step 1: Update app service**

Replace `src/renderer/src/services/app/index.ts` with:

```typescript
import { AppIPC } from '@shared/types/ipc';
import type { AppVersionInfo } from '@shared/types/ipc/invoke-map';

export type { AppVersionInfo };

export const appService = {
  onAppReady: (callback: () => void) => window.electronAPI.onAppReady(callback),
  requestAppReady: () => window.electronAPI.requestAppReady(),
  getVersion: (): Promise<AppVersionInfo> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.GET_VERSION),
  onUpdateDownloaded: (callback: () => void) =>
    window.electronAPI.onUpdateDownloaded(callback),
  installUpdate: (): Promise<void> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.INSTALL_UPDATE),
};
```

- [ ] **Step 2: Verify TypeScript is clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/services/app/index.ts
git commit -m "feat: add onUpdateDownloaded and installUpdate to app service"
```

---

### Task 5: Create useAutoUpdater hook with TDD

**Files:**
- Create: `src/renderer/src/hooks/useAutoUpdater.test.ts`
- Create: `src/renderer/src/hooks/useAutoUpdater.ts`

- [ ] **Step 1: Write the failing test**

Create `src/renderer/src/hooks/useAutoUpdater.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAutoUpdater } from './useAutoUpdater';

vi.mock('../services/app', () => ({
  appService: {
    onUpdateDownloaded: vi.fn(),
  },
}));

import { appService } from '../services/app';

describe('useAutoUpdater', () => {
  it('returns updateReady false initially', () => {
    const { result } = renderHook(() => useAutoUpdater());
    expect(result.current.updateReady).toBe(false);
  });

  it('returns updateReady true after update-downloaded fires', () => {
    let capturedCallback: (() => void) | undefined;
    vi.mocked(appService.onUpdateDownloaded).mockImplementation((cb) => {
      capturedCallback = cb;
    });

    const { result } = renderHook(() => useAutoUpdater());
    expect(result.current.updateReady).toBe(false);

    act(() => {
      capturedCallback?.();
    });

    expect(result.current.updateReady).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/renderer/src/hooks/useAutoUpdater.test.ts
```

Expected: FAIL — cannot find module `./useAutoUpdater`.

- [ ] **Step 3: Create the hook**

Create `src/renderer/src/hooks/useAutoUpdater.ts`:

```typescript
import { useEffect, useState } from 'react';
import { appService } from '../services/app';

export function useAutoUpdater(): { updateReady: boolean } {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    appService.onUpdateDownloaded(() => setUpdateReady(true));
  }, []);

  return { updateReady };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/renderer/src/hooks/useAutoUpdater.test.ts
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/hooks/useAutoUpdater.ts src/renderer/src/hooks/useAutoUpdater.test.ts
git commit -m "feat: add useAutoUpdater hook"
```

---

### Task 6: Create UpdateToast component with TDD

**Files:**
- Create: `src/renderer/src/components/UpdateToast/UpdateToast.test.tsx`
- Create: `src/renderer/src/components/UpdateToast/index.tsx`
- Modify: `src/renderer/src/layouts/AppLayout/index.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/renderer/src/components/UpdateToast/UpdateToast.test.tsx`:

```typescript
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import UpdateToast from './index';

vi.mock('sonner', () => ({ toast: vi.fn() }));

vi.mock('../../hooks/useAutoUpdater', () => ({
  useAutoUpdater: vi.fn(),
}));

vi.mock('../../services/app', () => ({
  appService: {
    installUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { appService } from '../../services/app';

describe('UpdateToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show toast when update is not ready', () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: false });
    render(<UpdateToast />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('shows persistent toast when update is ready', () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: true });
    render(<UpdateToast />);
    expect(toast).toHaveBeenCalledWith(
      'Update ready — Restart to apply',
      expect.objectContaining({ duration: Infinity }),
    );
  });

  it('calls installUpdate when Restart now is clicked', async () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: true });
    vi.mocked(toast).mockImplementation((_msg, opts: any) => {
      opts?.action?.onClick();
      return 'toast-id';
    });
    render(<UpdateToast />);
    expect(appService.installUpdate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/renderer/src/components/UpdateToast/UpdateToast.test.tsx
```

Expected: FAIL — cannot find module `./index`.

- [ ] **Step 3: Create the component**

Create `src/renderer/src/components/UpdateToast/index.tsx`:

```typescript
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { appService } from '../../services/app';

export default function UpdateToast() {
  const { updateReady } = useAutoUpdater();

  useEffect(() => {
    if (!updateReady) return;
    toast('Update ready — Restart to apply', {
      duration: Infinity,
      action: {
        label: 'Restart now',
        onClick: () => appService.installUpdate(),
      },
    });
  }, [updateReady]);

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/renderer/src/components/UpdateToast/UpdateToast.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Add UpdateToast to AppLayout**

Replace `src/renderer/src/layouts/AppLayout/index.tsx` with:

```typescript
import { TopNav } from "@/components/TopNav";
import UpdateToast from "@/components/UpdateToast";
import VersionBar from "@/components/VersionBar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      <VersionBar />
      <UpdateToast />
    </div>
  );
};

export default AppLayout;
```

- [ ] **Step 6: Run all tests**

```bash
pnpm vitest run
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/components/UpdateToast/ src/renderer/src/layouts/AppLayout/index.tsx
git commit -m "feat: add UpdateToast component with persistent restart prompt"
```

---

## Verification

1. **All tests pass:** `pnpm vitest run`
2. **TypeScript clean:** `npx tsc --noEmit && npx tsc -p tsconfig.electron.json --noEmit`
3. **Dev build works:** `pnpm run electron:dev` — no errors, no update toast visible (updater disabled in dev)
4. **End-to-end:** After a staging release is deployed and a newer version is on S3, install the older build and launch it — toast should appear at bottom-right after a moment
