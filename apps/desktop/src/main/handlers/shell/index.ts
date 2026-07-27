import { app, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { ShellIPC } from '@shared/types/ipc';

export function registerShellHandlers(): void {
  ipcMain.handle(
    ShellIPC.SAVE_FILE,
    async (_e, { filename, data }: { filename: string; data: number[] }) => {
      const filePath = path.join(app.getPath('downloads'), filename);
      await fs.promises.writeFile(filePath, Buffer.from(data));
      await shell.openPath(filePath);
      return filePath;
    },
  );

  ipcMain.handle(
    ShellIPC.SAVE_FILE_BASE64,
    async (_e, { filename, base64 }: { filename: string; base64: string }) => {
      const filePath = path.join(app.getPath('downloads'), filename);
      await fs.promises.writeFile(filePath, Buffer.from(base64, 'base64'));
      await shell.openPath(filePath);
      return filePath;
    },
  );
}
