# Auto-Update UX Design

**Date:** 2026-05-02
**Goal:** Replace `checkForUpdatesAndNotify()` with an in-app update experience — silent download, persistent "Restart to apply" toast when ready, dismissible.

---

## Behaviour

- **Update available / downloading:** Silent. No UI. User is not interrupted.
- **Update downloaded:** Persistent sonner toast appears at the bottom of the app: `"Update ready — Restart to apply"` with a **Restart now** button and an ✕ to dismiss.
- **Dismissed:** Toast is gone for the rest of the session. Reappears on next launch if still not applied.
- **Error:** Silent. Log to console only. Never surface updater errors to the user.
- **Dev mode:** Unchanged — `app.isPackaged` guard means the updater never runs locally.

## Code Signing

Out of scope for now. App ships unsigned. macOS users get a Gatekeeper warning on first launch but auto-update is otherwise unaffected. Signing can be added later by adding `CSC_LINK` / `CSC_KEY_PASSWORD` secrets and removing `CSC_IDENTITY_AUTO_DISCOVERY: false` from the workflows.

---

## Architecture

Follows the existing 4-layer IPC pattern.

### 1. Shared types — `src/shared/types/ipc/app.ts`

Add `INSTALL_UPDATE = 'app:install-update'` to `AppIPC`.

### 2. Shared invoke map — `src/shared/types/ipc/invoke-map.ts`

Add `'app:install-update': { args: []; return: void }`.

### 3. Preload — `src/main/preload.ts`

Add one push listener and one invoke:
- `onUpdateDownloaded(callback: () => void)` — registers `ipcRenderer.on('app:update-downloaded', callback)`
- `installUpdate: ()` — already covered by the generic `ipcRenderer.invoke`

### 4. Main handler — `src/main/handlers/app/index.ts`

- Remove `checkForUpdatesAndNotify()` call from `main.ts`; call `autoUpdater.checkForUpdates()` instead
- In `registerAppHandlers()`:
  - `autoUpdater.on('update-downloaded', () => BrowserWindow.getFocusedWindow()?.webContents.send('app:update-downloaded'))`
  - `autoUpdater.on('error', (err) => console.error('[updater]', err))`
  - `ipcMain.handle(AppIPC.INSTALL_UPDATE, () => autoUpdater.quitAndInstall())`

### 5. Renderer service — `src/renderer/src/services/app/index.ts`

Add:
- `onUpdateDownloaded(cb: () => void)` — calls `window.electronAPI.onUpdateDownloaded(cb)`
- `installUpdate()` — calls `window.electronAPI.ipcRenderer.invoke(AppIPC.INSTALL_UPDATE)`

### 6. Hook — `src/renderer/src/hooks/useAutoUpdater.ts`

```ts
// Returns { updateReady } — true once update-downloaded fires
```

Registers `appService.onUpdateDownloaded` on mount. Sets `updateReady = true`.

### 7. Component — `src/renderer/src/components/UpdateToast/index.tsx`

- Calls `useAutoUpdater()`
- When `updateReady` becomes true, calls `toast('Update ready — Restart to apply', { ... })` via sonner with a **Restart now** action button and persistent duration
- "Restart now" calls `appService.installUpdate()`

### 8. AppLayout — `src/renderer/src/layouts/AppLayout/index.tsx`

Mount `<UpdateToast />` alongside `<VersionBar />`.

---

## Testing

- Unit test `UpdateToast`: mock `useAutoUpdater` returning `{ updateReady: true }`, assert toast is shown; mock `appService.installUpdate` and assert it's called on button click.
- `useAutoUpdater` hook: mock `appService.onUpdateDownloaded` to fire callback immediately, assert `updateReady` becomes true.
