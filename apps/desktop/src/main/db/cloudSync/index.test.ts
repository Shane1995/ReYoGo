import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockExistsSync, mockUnlinkSync, store, makeTable, mockLocalDb, mockRemoteDb } = vi.hoisted(
  () => {
    const store: Record<string, unknown> = {};
    const mockExistsSync = vi.fn(() => false);
    const mockUnlinkSync = vi.fn();

    function makeTable(sqlName: string): object {
      const t: Record<symbol, string> = {};
      t[Symbol.for('drizzle:Name')] = sqlName;
      return t;
    }

    const mockRemoteDb = {
      select: vi.fn(() => ({
        from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
      })),
    };

    const mockLocalDb = {
      select: vi.fn(() => ({
        from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
      })),
    };

    return { mockExistsSync, mockUnlinkSync, store, makeTable, mockLocalDb, mockRemoteDb };
  },
);

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/test-userdata'), isPackaged: false },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((s: string) => Buffer.from(`enc:${s}`)),
    decryptString: vi.fn((b: Buffer) => b.toString().replace('enc:', '')),
  },
  BrowserWindow: { getAllWindows: vi.fn(() => []) },
}));

vi.mock('./store', () => ({
  store: {
    get: (key: string, def?: unknown) => store[key] ?? def,
    set: (key: string, val: unknown) => {
      store[key] = val;
    },
    delete: (key: string) => {
      delete store[key];
    },
  },
}));

vi.mock('fs', () => ({
  default: { existsSync: mockExistsSync, unlinkSync: mockUnlinkSync },
  existsSync: mockExistsSync,
  unlinkSync: mockUnlinkSync,
}));

vi.mock('@reyogo/db', () => ({
  createDbClient: vi.fn(() => ({ db: mockRemoteDb, close: vi.fn() })),
  schema: {
    accounts: makeTable('accounts'),
    businessGroups: makeTable('business_groups'),
    entities: makeTable('entities'),
    suppliers: makeTable('suppliers'),
    inventoryCategories: makeTable('inventory_categories'),
    unitsOfMeasure: makeTable('units_of_measure'),
    inventoryItems: makeTable('inventory_items'),
    invoices: makeTable('invoices'),
    invoiceLineItems: makeTable('invoice_line_items'),
    stockMovements: makeTable('stock_movements'),
    invoiceAuditLog: makeTable('invoice_audit_log'),
    stockCountSessions: makeTable('stock_count_sessions'),
    stockCountLines: makeTable('stock_count_lines'),
    costingSnapshots: makeTable('costing_snapshots'),
  },
}));

vi.mock('drizzle-orm/libsql/migrator', () => ({
  migrate: vi.fn(() => Promise.resolve()),
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
  recordSyncSuccess,
  recordSyncError,
  scheduleErrorAfterTimeout,
  _resetForTest,
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
    expect(hasLocalReplica('/tmp/test-userdata/data/replica.db')).toBe(false);
  });

  it('returns true when replica file exists', () => {
    mockExistsSync.mockReturnValue(true);
    expect(hasLocalReplica('/tmp/test-userdata/data/replica.db')).toBe(true);
    expect(mockExistsSync).toHaveBeenCalledWith('/tmp/test-userdata/data/replica.db');
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

describe('recordSyncSuccess', () => {
  beforeEach(() => {
    resetStore();
    clearCredentials();
    vi.clearAllMocks();
  });

  it('stores the current ISO timestamp in cloudSync.lastSyncedAt', () => {
    const before = Date.now();
    recordSyncSuccess();
    const after = Date.now();
    const stored = store['cloudSync.lastSyncedAt'];
    if (typeof stored !== 'string') throw new Error('cloudSync.lastSyncedAt is not a string');
    const storedTime = new Date(stored).getTime();
    expect(storedTime).toBeGreaterThanOrEqual(before);
    expect(storedTime).toBeLessThanOrEqual(after);
  });

  it('clears cloudSync.syncError', () => {
    store['cloudSync.syncError'] = 'previous error';
    recordSyncSuccess();
    expect(store['cloudSync.syncError']).toBeUndefined();
  });
});

describe('recordSyncError', () => {
  beforeEach(() => {
    resetStore();
    clearCredentials();
  });

  it('stores the message in cloudSync.syncError', () => {
    recordSyncError('Something went wrong');
    expect(store['cloudSync.syncError']).toBe('Something went wrong');
  });
});

describe('scheduleErrorAfterTimeout', () => {
  beforeEach(() => {
    resetStore();
    clearCredentials();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a cancel function', () => {
    const cancel = scheduleErrorAfterTimeout();
    expect(typeof cancel).toBe('function');
    cancel();
  });

  it('does not call recordSyncError when cancel is called before timeout', () => {
    const cancel = scheduleErrorAfterTimeout();
    cancel();
    vi.advanceTimersByTime(300000);
    expect(store['cloudSync.syncError']).toBeUndefined();
  });

  it('calls recordSyncError after 300000ms', () => {
    scheduleErrorAfterTimeout();
    vi.advanceTimersByTime(300000);
    expect(store['cloudSync.syncError']).toBe('Sync timed out');
  });
});

describe('activateCloudSync', () => {
  beforeEach(() => {
    resetStore();
    _resetForTest();
    vi.clearAllMocks();
    mockRemoteDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
    });
    mockRemoteDb.insert.mockReturnValue({
      values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
    });
    mockLocalDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
    });
  });

  it('emits Progress events and Success on the success path', async () => {
    const mockSend = vi.fn();
    const mockWebContents = { send: mockSend } satisfies Pick<
      import('electron').WebContents,
      'send'
    >;

    const row: Record<string, unknown> = { id: 'row1' };
    mockLocalDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([row])),
    });
    mockRemoteDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([row])),
    });
    mockRemoteDb.insert.mockReturnValue({
      values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
    });

    await activateCloudSync(
      mockWebContents,
      mockLocalDb as never,
      'libsql://example.turso.io',
      'my-token',
    );

    const sentEvents = mockSend.mock.calls.map(([, event]) => event);
    const progressEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Progress);
    const successEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Success);

    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Migrating)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Pushing)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Verifying)).toBe(true);
    expect(progressEvents.some((e) => e.stage === CloudSyncStage.Activating)).toBe(true);
    expect(successEvents).toHaveLength(1);
    expect(mockRemoteDb.insert).toHaveBeenCalled();
    expect(store['cloudSync.tursoUrl']).toBe('libsql://example.turso.io');
  });

  it('emits Error when remote has fewer rows than were pushed (data loss)', async () => {
    const mockSend = vi.fn();
    const mockWebContents = { send: mockSend } satisfies Pick<
      import('electron').WebContents,
      'send'
    >;

    mockLocalDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([{ id: 'row1' }])),
    });
    mockRemoteDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
    });

    await activateCloudSync(
      mockWebContents,
      mockLocalDb as never,
      'libsql://example.turso.io',
      'my-token',
    );

    const sentEvents = mockSend.mock.calls.map(([, event]) => event);
    const errorEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Error);
    expect(errorEvents.length).toBeGreaterThan(0);
    expect(errorEvents[0].retryable).toBe(true);
    expect(store['cloudSync.tursoUrl']).toBeUndefined();
  });

  it('succeeds when remote has more rows than local (pre-existing remote data)', async () => {
    const mockSend = vi.fn();
    const mockWebContents = { send: mockSend } satisfies Pick<
      import('electron').WebContents,
      'send'
    >;

    const localRow: Record<string, unknown> = { id: 'row1' };
    const extraRow: Record<string, unknown> = { id: 'row2' };
    mockLocalDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([localRow])),
    });
    mockRemoteDb.select.mockReturnValue({
      from: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([localRow, extraRow])),
    });
    mockRemoteDb.insert.mockReturnValue({
      values: vi.fn(() => ({ onConflictDoNothing: vi.fn(() => Promise.resolve()) })),
    });

    await activateCloudSync(
      mockWebContents,
      mockLocalDb as never,
      'libsql://example.turso.io',
      'my-token',
    );

    const sentEvents = mockSend.mock.calls.map(([, event]) => event);
    const successEvents = sentEvents.filter((e) => e.type === CloudSyncEventType.Success);
    expect(successEvents).toHaveLength(1);
    expect(store['cloudSync.tursoUrl']).toBe('libsql://example.turso.io');
  });
});
