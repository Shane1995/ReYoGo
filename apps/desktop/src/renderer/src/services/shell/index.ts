import { ShellIPC } from '@shared/types/ipc';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const shellService = {
  saveFileBase64: (payload: { filename: string; base64: string }) =>
    invoke()(ShellIPC.SAVE_FILE_BASE64, payload),
};
