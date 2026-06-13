import type { ReconnectButtonProps } from './types';

export function ReconnectButton({ connecting, canConnect, onClick }: ReconnectButtonProps) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      onClick={onClick}
      disabled={!canConnect || connecting}
    >
      {connecting ? 'Connecting…' : 'Reconnect'}
    </button>
  );
}
