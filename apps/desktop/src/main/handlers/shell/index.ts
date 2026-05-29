import { app, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function registerShellHandlers(): void {
  ipcMain.handle(
    'shell:save-file',
    async (_e, { filename, data }: { filename: string; data: number[] }) => {
      const filePath = path.join(app.getPath('downloads'), filename);
      await fs.promises.writeFile(filePath, Buffer.from(data));
      await shell.openPath(filePath);
      return filePath;
    },
  );

  ipcMain.handle(
    'shell:save-file-base64',
    async (_e, { filename, base64 }: { filename: string; base64: string }) => {
      const filePath = path.join(app.getPath('downloads'), filename);
      await fs.promises.writeFile(filePath, Buffer.from(base64, 'base64'));
      await shell.openPath(filePath);
      return filePath;
    },
  );
}
