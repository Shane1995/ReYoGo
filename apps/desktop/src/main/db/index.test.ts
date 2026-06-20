import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExistsSync } = vi.hoisted(() => {
  const mockExistsSync = vi.fn(() => false);
  return { mockExistsSync };
});

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/test'), isPackaged: false },
}));

vi.mock('fs', () => ({
  default: { existsSync: mockExistsSync, mkdirSync: vi.fn(), unlinkSync: vi.fn() },
  existsSync: mockExistsSync,
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('@reyogo/db', () => ({
  createReplicaClient: vi.fn(),
  createInventoryRepo: vi.fn(),
  createSuppliersRepo: vi.fn(),
  createStockMovementsRepo: vi.fn(),
  createInvoicesRepo: vi.fn(),
  createSetupRepo: vi.fn(),
  createEntitiesRepo: vi.fn(),
  schema: {
    accounts: { id: {}, [Symbol.for('drizzle:Name')]: 'accounts' },
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(() => ({})),
}));

vi.mock('drizzle-orm/libsql/migrator', () => ({ migrate: vi.fn(() => Promise.resolve()) }));

vi.mock('@shared/ipc-events', () => ({ DB_READY_CHANNEL: 'db:ready' }));

vi.mock('./cloudSync', () => ({
  hasCloudCredentials: vi.fn(() => false),
  getStoredCredentials: vi.fn(() => null),
  clearCredentials: vi.fn(),
  recordSyncError: vi.fn(),
  hasEverSynced: vi.fn(() => false),
  withSyncTimeout: vi.fn((p: Promise<unknown>) => p),
}));

import {
  _setDbStateForTest,
  closeDb,
  isDbInitialized,
  _attemptPreRecoverySyncForTest,
} from './index';
import { createReplicaClient } from '@reyogo/db';

function resetMocks() {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(false);
}

describe('closeDb', () => {
  beforeEach(() => {
    resetMocks();
    _setDbStateForTest(null, null, null);
  });

  it('does nothing and does not throw when db is not initialized', () => {
    expect(() => closeDb()).not.toThrow();
  });

  it('calls close on the active handle and reports db as no longer initialized', () => {
    const mockHandle = { close: vi.fn(), sync: vi.fn() };
    _setDbStateForTest(mockHandle as never, {} as never, {} as never);

    closeDb();

    expect(mockHandle.close).toHaveBeenCalledOnce();
    expect(isDbInitialized()).toBe(false);
  });

  it('resets state even if handle.close() throws', () => {
    const mockHandle = {
      close: vi.fn(() => {
        throw new Error('close failed');
      }),
      sync: vi.fn(),
    };
    _setDbStateForTest(mockHandle as never, {} as never, {} as never);

    closeDb();

    expect(isDbInitialized()).toBe(false);
  });
});

describe('_attemptPreRecoverySyncForTest', () => {
  const credentials = { tursoUrl: 'libsql://x.io', authToken: 'token' };

  beforeEach(() => {
    resetMocks();
    vi.mocked(createReplicaClient).mockReset();
  });

  it('does nothing when replica db file does not exist', async () => {
    mockExistsSync.mockReturnValue(false);
    await _attemptPreRecoverySyncForTest('/tmp/replica.db', credentials);
    expect(createReplicaClient).not.toHaveBeenCalled();
  });

  it('opens a client and calls sync when replica db file exists', async () => {
    const mockSync = vi.fn(() => Promise.resolve());
    const mockClose = vi.fn();
    vi.mocked(createReplicaClient).mockReturnValue({
      sync: mockSync,
      close: mockClose,
      db: {},
    } as never);
    mockExistsSync.mockReturnValue(true);

    await _attemptPreRecoverySyncForTest('/tmp/replica.db', credentials);

    expect(createReplicaClient).toHaveBeenCalledWith('/tmp/replica.db', 'libsql://x.io', 'token');
    expect(mockSync).toHaveBeenCalledOnce();
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('closes handle and resolves without throwing when sync fails', async () => {
    const mockClose = vi.fn();
    vi.mocked(createReplicaClient).mockReturnValue({
      sync: vi.fn(() => Promise.reject(new Error('sync failed'))),
      close: mockClose,
      db: {},
    } as never);
    mockExistsSync.mockReturnValue(true);

    await expect(
      _attemptPreRecoverySyncForTest('/tmp/replica.db', credentials),
    ).resolves.toBeUndefined();
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('resolves without throwing when createReplicaClient itself throws', async () => {
    vi.mocked(createReplicaClient).mockImplementation(() => {
      throw new Error('cannot open');
    });
    mockExistsSync.mockReturnValue(true);

    await expect(
      _attemptPreRecoverySyncForTest('/tmp/replica.db', credentials),
    ).resolves.toBeUndefined();
  });
});
