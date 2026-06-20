import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  registeredHandlers,
  mockSyncViaUtilityProcess,
  mockReinitialiseNoSync,
  mockRecordSyncSuccess,
  mockWipeReplicaFiles,
  mockSaveCredentials,
  mockClearCredentials,
} = vi.hoisted(() => {
  const registeredHandlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    registeredHandlers,
    mockSyncViaUtilityProcess: vi.fn(() => Promise.resolve()),
    mockReinitialiseNoSync: vi.fn(() => Promise.resolve()),
    mockRecordSyncSuccess: vi.fn(),
    mockWipeReplicaFiles: vi.fn(),
    mockSaveCredentials: vi.fn(),
    mockClearCredentials: vi.fn(),
  };
});

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
      registeredHandlers.set(channel, handler);
    }),
  },
}));

vi.mock('../../db', () => ({
  getDb: vi.fn(),
  getLocalDbPath: vi.fn(() => '/tmp/test.db'),
  getReplicaPath: vi.fn(() => '/tmp/replica.db'),
  reinitialise: vi.fn(() => Promise.resolve()),
  reinitialiseNoSync: mockReinitialiseNoSync,
  syncViaUtilityProcess: mockSyncViaUtilityProcess,
  wipeReplicaFiles: mockWipeReplicaFiles,
}));

vi.mock('../../db/cloudSync', () => ({
  activateCloudSync: vi.fn(() => Promise.resolve()),
  getSyncStatus: vi.fn(() => ({ state: 'idle', lastSyncedAt: null, error: null })),
  getStoredCredentials: vi.fn(() => null),
  getTursoUrl: vi.fn(() => null),
  hasCloudCredentials: vi.fn(() => false),
  hasLocalReplica: vi.fn(() => false),
  deleteLocalBackup: vi.fn(),
  recordSyncSuccess: mockRecordSyncSuccess,
  recordSyncError: vi.fn(),
  saveCredentials: mockSaveCredentials,
  clearCredentials: mockClearCredentials,
  updateStoredToken: vi.fn(),
  withSyncTimeout: vi.fn((p: Promise<unknown>) => p),
  INITIAL_SYNC_TIMEOUT_MS: 180_000,
}));

vi.mock('./classifyConnectError', () => ({
  classifyConnectError: vi.fn((err: unknown) => err),
  getErrorCode: vi.fn(() => 'unknown'),
}));

import { registerSettingsHandlers } from './index';

describe('registerSettingsHandlers', () => {
  it('registers without throwing', () => {
    expect(() => registerSettingsHandlers()).not.toThrow();
  });
});

describe('handleConnect', () => {
  beforeEach(() => {
    registeredHandlers.clear();
    vi.clearAllMocks();
    mockSyncViaUtilityProcess.mockReturnValue(Promise.resolve());
    mockReinitialiseNoSync.mockReturnValue(Promise.resolve());
    registerSettingsHandlers();
  });

  it('calls recordSyncSuccess after a successful connect', async () => {
    const handler = registeredHandlers.get('cloud-sync:connect')!;
    await handler(null, 'libsql://example.turso.io', 'my-token');
    expect(mockRecordSyncSuccess).toHaveBeenCalledOnce();
  });

  it('does not call recordSyncSuccess when syncViaUtilityProcess rejects', async () => {
    mockSyncViaUtilityProcess.mockReturnValue(Promise.reject(new Error('network error')));
    const handler = registeredHandlers.get('cloud-sync:connect')!;
    await expect(handler(null, 'libsql://example.turso.io', 'my-token')).rejects.toThrow();
    expect(mockRecordSyncSuccess).not.toHaveBeenCalled();
  });

  it('does not call recordSyncSuccess when reinitialiseNoSync rejects', async () => {
    mockReinitialiseNoSync.mockReturnValue(Promise.reject(new Error('reinit failed')));
    const handler = registeredHandlers.get('cloud-sync:connect')!;
    await expect(handler(null, 'libsql://example.turso.io', 'my-token')).rejects.toThrow();
    expect(mockRecordSyncSuccess).not.toHaveBeenCalled();
  });

  it('throws immediately for a non-libsql URL without touching sync', async () => {
    const handler = registeredHandlers.get('cloud-sync:connect')!;
    await expect(handler(null, 'https://example.turso.io', 'my-token')).rejects.toThrow(
      'Invalid URL — must start with libsql://',
    );
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
    expect(mockRecordSyncSuccess).not.toHaveBeenCalled();
  });
});
