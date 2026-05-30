import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExistsSync, mockUnlinkSync, store } = vi.hoisted(() => {
  const store: Record<string, unknown> = {};
  const mockExistsSync = vi.fn(() => false);
  const mockUnlinkSync = vi.fn();
  return { mockExistsSync, mockUnlinkSync, store };
});

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/test-userdata'), isPackaged: false },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((s: string) => Buffer.from(`enc:${s}`)),
    decryptString: vi.fn((b: Buffer) => b.toString().replace('enc:', '')),
  },
  BrowserWindow: { getAllWindows: vi.fn(() => []) },
}));

vi.mock('electron-store', () => {
  const MockStore = vi.fn(function () {
    return {
      get: (key: string, def?: unknown) => store[key] ?? def,
      set: (key: string, val: unknown) => {
        store[key] = val;
      },
      delete: (key: string) => {
        delete store[key];
      },
    };
  });
  return { default: MockStore };
});

vi.mock('fs', () => ({
  default: { existsSync: mockExistsSync, unlinkSync: mockUnlinkSync },
  existsSync: mockExistsSync,
  unlinkSync: mockUnlinkSync,
}));

vi.mock('@libsql/client', () => ({
  createClient: vi.fn(() => ({
    close: vi.fn(),
  })),
}));

vi.mock('drizzle-orm/libsql', () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn(() => ({ from: vi.fn(() => Promise.resolve([])) })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
    })),
  })),
}));

vi.mock('drizzle-orm/libsql/migrator', () => ({
  migrate: vi.fn(() => Promise.resolve()),
}));

vi.mock('@reyogo/db', () => ({
  schema: {
    accounts: {},
    businessGroups: {},
    entities: {},
    suppliers: {},
    inventoryCategories: {},
    unitsOfMeasure: {},
    inventoryItems: {},
    invoices: {},
    invoiceLineItems: {},
    stockMovements: {},
    invoiceAuditLog: {},
    stockCountSessions: {},
    stockCountLines: {},
    costingSnapshots: {},
  },
}));

vi.mock('@shared/ipc-events', () => ({
  CLOUD_SYNC_EVENT_CHANNEL: 'cloud-sync-event',
}));

import {
  hasCloudCredentials,
  hasLocalReplica,
  getTursoUrl,
  getStoredCredentials,
  getSyncStatus,
  clearCredentials,
  deleteLocalBackup,
  activateCloudSync,
} from './index';
import { SyncState, CloudSyncEventType, CloudSyncStage } from '@shared/types/cloudSync';
import { safeStorage } from 'electron';

function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}

describe('hasCloudCredentials', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('returns false when no credentials stored', () => {
    expect(hasCloudCredentials()).toBe(false);
  });

  it('returns false when only url is stored', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    expect(hasCloudCredentials()).toBe(false);
  });

  it('returns false when only token is stored', () => {
    store['cloudSync.authTokenEncrypted'] = 'enc:token';
    expect(hasCloudCredentials()).toBe(false);
  });

  it('returns true when both tursoUrl and authTokenEncrypted are stored', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    store['cloudSync.authTokenEncrypted'] = 'enc:token';
    expect(hasCloudCredentials()).toBe(true);
  });
});

describe('hasLocalReplica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when replica file does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    expect(hasLocalReplica()).toBe(false);
  });

  it('returns true when replica file exists', () => {
    mockExistsSync.mockReturnValue(true);
    expect(hasLocalReplica()).toBe(true);
    expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('replica.db'));
  });
});

describe('getTursoUrl', () => {
  beforeEach(() => {
    resetStore();
  });

  it('returns null when url is not stored', () => {
    expect(getTursoUrl()).toBeNull();
  });

  it('returns stored url when set', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    expect(getTursoUrl()).toBe('libsql://example.turso.io');
  });
});

describe('getStoredCredentials', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('returns null when no credentials stored', () => {
    expect(getStoredCredentials()).toBeNull();
  });

  it('returns null when only url is stored', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    expect(getStoredCredentials()).toBeNull();
  });

  it('returns decrypted credentials when both are stored', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    const encryptedBuffer = Buffer.from('enc:my-secret-token');
    store['cloudSync.authTokenEncrypted'] = encryptedBuffer.toString('base64');
    vi.mocked(safeStorage.decryptString).mockReturnValue('my-secret-token');

    const result = getStoredCredentials();
    expect(result).toEqual({ tursoUrl: 'libsql://example.turso.io', authToken: 'my-secret-token' });
  });
});

describe('getSyncStatus', () => {
  beforeEach(() => {
    resetStore();
    clearCredentials();
  });

  it('returns idle state with null lastSyncedAt and error initially', () => {
    const status = getSyncStatus();
    expect(status.state).toBe(SyncState.Idle);
    expect(status.lastSyncedAt).toBeNull();
    expect(status.error).toBeNull();
  });
});

describe('clearCredentials', () => {
  beforeEach(() => {
    resetStore();
  });

  it('removes all credential and sync keys from store', () => {
    store['cloudSync.tursoUrl'] = 'libsql://example.turso.io';
    store['cloudSync.authTokenEncrypted'] = 'enc:token';
    store['cloudSync.lastSyncedAt'] = new Date().toISOString();
    store['cloudSync.syncError'] = 'some error';

    clearCredentials();

    expect(store['cloudSync.tursoUrl']).toBeUndefined();
    expect(store['cloudSync.authTokenEncrypted']).toBeUndefined();
    expect(store['cloudSync.lastSyncedAt']).toBeUndefined();
    expect(store['cloudSync.syncError']).toBeUndefined();
  });

  it('resets sync status to idle', () => {
    clearCredentials();
    const status = getSyncStatus();
    expect(status.state).toBe(SyncState.Idle);
    expect(status.lastSyncedAt).toBeNull();
    expect(status.error).toBeNull();
  });
});

describe('deleteLocalBackup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls unlinkSync when file exists', () => {
    mockExistsSync.mockReturnValue(true);
    deleteLocalBackup('/tmp/test.db');
    expect(mockUnlinkSync).toHaveBeenCalledWith('/tmp/test.db');
  });

  it('does nothing when file does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    deleteLocalBackup('/tmp/test.db');
    expect(mockUnlinkSync).not.toHaveBeenCalled();
  });
});

describe('activateCloudSync', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('emits Progress events and Success on the success path', async () => {
    const { BrowserWindow } = await import('electron');
    const mockSend = vi.fn();
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      { webContents: { send: mockSend } } as never,
    ]);

    const { createClient } = await import('@libsql/client');
    const mockClose = vi.fn().mockResolvedValue(undefined);
    const mockFromResult = vi.fn(() => Promise.resolve([]));
    const mockFrom = vi.fn(() => mockFromResult());
    const mockSelect = vi.fn(() => ({ from: mockFrom }));
    const mockOnConflictDoNothing = vi.fn(() => Promise.resolve());
    const mockValues = vi.fn(() => ({ onConflictDoNothing: mockOnConflictDoNothing }));
    const mockInsert = vi.fn(() => ({ values: mockValues }));

    vi.mocked(createClient).mockReturnValue({
      close: mockClose,
    } as never);

    const { drizzle } = await import('drizzle-orm/libsql');
    vi.mocked(drizzle).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    } as never);

    await activateCloudSync('/tmp/local.db', 'libsql://example.turso.io', 'my-token');

    const sentEvents = mockSend.mock.calls.map(([, event]) => event);
    const progressEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Progress);
    const successEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Success);

    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Migrating)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Pushing)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Verifying)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Activating)).toBe(true);
    expect(successEvents).toHaveLength(1);
  });

  it('emits Error event when row count mismatch occurs', async () => {
    const { BrowserWindow } = await import('electron');
    const mockSend = vi.fn();
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      { webContents: { send: mockSend } } as never,
    ]);

    const { createClient } = await import('@libsql/client');
    const mockClose = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createClient).mockReturnValue({ close: mockClose } as never);

    let callCount = 0;
    const mockFrom = vi.fn(() => {
      callCount++;
      if (callCount > 14 + 14) {
        return Promise.resolve([{ id: '1' }]);
      }
      return Promise.resolve([]);
    });
    const mockSelect = vi.fn(() => ({ from: mockFrom }));
    const mockOnConflictDoNothing = vi.fn(() => Promise.resolve());
    const mockValues = vi.fn(() => ({ onConflictDoNothing: mockOnConflictDoNothing }));
    const mockInsert = vi.fn(() => ({ values: mockValues }));

    const { drizzle } = await import('drizzle-orm/libsql');
    vi.mocked(drizzle)
      .mockReturnValueOnce({ select: mockSelect, insert: mockInsert } as never)
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          from: vi.fn(() => Promise.resolve([{ id: '1' }])),
        })),
        insert: mockInsert,
      } as never);

    await expect(
      activateCloudSync('/tmp/local.db', 'libsql://example.turso.io', 'my-token'),
    ).rejects.toThrow('Row count mismatch');

    const sentEvents = mockSend.mock.calls.map(([, event]) => event);
    const errorEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Error);
    expect(errorEvents.length).toBeGreaterThan(0);
    expect(errorEvents[0].retryable).toBe(true);
  });
});
