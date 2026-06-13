export function reconnectErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Connection failed. Please try again.';
}
