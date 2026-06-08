const IPC_INVOKE_ERROR_PATTERN = /^Error invoking remote method '[^']*':\s*(?:Error:\s*)?/;

export function ipcErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  return err.message.replace(IPC_INVOKE_ERROR_PATTERN, '') || fallback;
}
