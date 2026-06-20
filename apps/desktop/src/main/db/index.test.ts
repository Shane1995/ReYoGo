import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExistsSync, mockLocalDbHandle, mockLocalDb, mockTargetDb } = vi.hoisted(() => {
  const mockLocalDb = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((): Promise<Record<string, unknown>[]> => Promise.resolve([])),
      })),
    })),
  };
  const mockTargetDb = {
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
  };
  const mockLocalDbHandle = { db: mockLocalDb, close: vi.fn() };
  const mockExistsSync = vi.fn(() => false);

  return { mockExistsSync, mockLocalDbHandle, mockLocalDb, mockTargetDb };
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
  createDbClient: vi.fn(() => mockLocalDbHandle),
  createReplicaClient: vi.fn(),
  createInventoryRepo: vi.fn(),
  createSuppliersRepo: vi.fn(),
  createStockMovementsRepo: vi.fn(),
  createInvoicesRepo: vi.fn(),
  createSetupRepo: vi.fn(),
  createEntitiesRepo: vi.fn(),
  schema: {
    accounts: { id: {}, [Symbol.for('drizzle:Name')]: 'accounts' },
    inventoryItems: {
      id: {},
      unitOfMeasureId: {},
      [Symbol.for('drizzle:Name')]: 'inventory_items',
    },
  },
}));

vi.mock('drizzle-orm', () => ({
  and: vi.fn(() => ({})),
  eq: vi.fn(() => ({})),
  isNotNull: vi.fn(() => ({})),
  isNull: vi.fn(() => ({})),
}));

vi.mock('drizzle-orm/libsql/migrator', () => ({ migrate: vi.fn(() => Promise.resolve()) }));

vi.mock('@shared/ipc-events', () => ({ DB_READY_CHANNEL: 'db:ready' }));

vi.mock('./cloudSync', () => ({
  hasCloudCredentials: vi.fn(() => false),
  getStoredCredentials: vi.fn(() => null),
  clearCredentials: vi.fn(),
  recordSyncError: vi.fn(),
  hasEverSynced: vi.fn(() => false),
  hasUomRepairRun: vi.fn(() => false),
  markUomRepairDone: vi.fn(),
  withSyncTimeout: vi.fn((p: Promise<unknown>) => p),
}));

import {
  repairUomLinks,
  repairUomLinksIfNeeded,
  _setDbStateForTest,
  closeDb,
  isDbInitialized,
  _attemptPreRecoverySyncForTest,
} from './index';
import { hasUomRepairRun, markUomRepairDone } from './cloudSync';
import { createDbClient, createReplicaClient } from '@reyogo/db';

function resetMocks() {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(false);
  mockLocalDb.select.mockReturnValue({
    from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) })),
  });
  mockTargetDb.update.mockReturnValue({
    set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
  });
}

describe('repairUomLinks', () => {
  beforeEach(resetMocks);

  it('does nothing when source returns no items with UoM set', async () => {
    await repairUomLinks(mockLocalDb as never, mockTargetDb as never);

    expect(mockTargetDb.update).not.toHaveBeenCalled();
  });

  it('updates each item in target using the unitOfMeasureId from source', async () => {
    const mockWhere = vi.fn(() => Promise.resolve());
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    mockTargetDb.update.mockReturnValue({ set: mockSet });

    mockLocalDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() =>
          Promise.resolve([
            { id: 'item-1', unitOfMeasureId: 'uom-litres' },
            { id: 'item-2', unitOfMeasureId: 'uom-each' },
          ]),
        ),
      })),
    });

    await repairUomLinks(mockLocalDb as never, mockTargetDb as never);

    expect(mockTargetDb.update).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith({ unitOfMeasureId: 'uom-litres' });
    expect(mockSet).toHaveBeenCalledWith({ unitOfMeasureId: 'uom-each' });
  });

  it('skips source items where unitOfMeasureId is unexpectedly null', async () => {
    mockLocalDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'item-1', unitOfMeasureId: null }])),
      })),
    });

    await repairUomLinks(mockLocalDb as never, mockTargetDb as never);

    expect(mockTargetDb.update).not.toHaveBeenCalled();
  });
});

describe('repairUomLinksIfNeeded', () => {
  beforeEach(() => {
    resetMocks();
    _setDbStateForTest(null, null);
    vi.mocked(hasUomRepairRun).mockReturnValue(false);
  });

  it('does nothing when not in replica mode', async () => {
    _setDbStateForTest(null, null);

    await repairUomLinksIfNeeded();

    expect(createDbClient).not.toHaveBeenCalled();
    expect(markUomRepairDone).not.toHaveBeenCalled();
  });

  it('does nothing when repair has already been run', async () => {
    _setDbStateForTest({ sync: vi.fn() } as never, {} as never);
    vi.mocked(hasUomRepairRun).mockReturnValue(true);

    await repairUomLinksIfNeeded();

    expect(createDbClient).not.toHaveBeenCalled();
    expect(markUomRepairDone).not.toHaveBeenCalled();
  });

  it('marks repair done and returns early when original db file does not exist', async () => {
    _setDbStateForTest({ sync: vi.fn() } as never, {} as never);
    mockExistsSync.mockReturnValue(false);

    await repairUomLinksIfNeeded();

    expect(createDbClient).not.toHaveBeenCalled();
    expect(markUomRepairDone).toHaveBeenCalledOnce();
  });

  it('opens original db, runs repair, and marks done when all conditions are met', async () => {
    const fakeTargetDb = {
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
    };
    _setDbStateForTest({ sync: vi.fn() } as never, fakeTargetDb as never);
    mockExistsSync.mockReturnValue(true);
    mockLocalDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'item-1', unitOfMeasureId: 'uom-1' }])),
      })),
    });

    await repairUomLinksIfNeeded();

    expect(createDbClient).toHaveBeenCalledWith(expect.stringContaining('app'));
    expect(mockLocalDbHandle.close).toHaveBeenCalled();
    expect(markUomRepairDone).toHaveBeenCalledOnce();
  });

  it('marks repair done in finally even when the repair throws', async () => {
    _setDbStateForTest({ sync: vi.fn() } as never, {} as never);
    mockExistsSync.mockReturnValue(true);
    mockLocalDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.reject(new Error('db error'))),
      })),
    });

    await expect(repairUomLinksIfNeeded()).rejects.toThrow('db error');

    expect(mockLocalDbHandle.close).toHaveBeenCalled();
    expect(markUomRepairDone).toHaveBeenCalledOnce();
  });
});

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
