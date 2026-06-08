import { describe, it, expect } from 'vitest';
import { ipcErrorMessage } from './index';

describe('ipcErrorMessage', () => {
  it('strips the Electron IPC invoke wrapper prefix', () => {
    const err = new Error(
      "Error invoking remote method 'cloud-sync:connect': Error: Authentication failed — check your auth token.",
    );
    expect(ipcErrorMessage(err, 'fallback')).toBe('Authentication failed — check your auth token.');
  });

  it('returns the message unchanged when there is no IPC wrapper prefix', () => {
    const err = new Error('Authentication failed — check your auth token.');
    expect(ipcErrorMessage(err, 'fallback')).toBe('Authentication failed — check your auth token.');
  });

  it('returns the fallback for non-Error values', () => {
    expect(ipcErrorMessage('boom', 'fallback')).toBe('fallback');
    expect(ipcErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the stripped message is empty', () => {
    const err = new Error("Error invoking remote method 'cloud-sync:connect': Error: ");
    expect(ipcErrorMessage(err, 'fallback')).toBe('fallback');
  });
});
