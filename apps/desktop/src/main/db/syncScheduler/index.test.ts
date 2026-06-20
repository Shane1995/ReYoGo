import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  mockIsReplicaMode,
  mockGetReplicaPath,
  mockSyncViaUtilityProcess,
  mockGetStoredCredentials,
  mockRecordSyncSuccess,
  mockRecordSyncError,
  mockIsOnline,
} = vi.hoisted(() => ({
  mockIsReplicaMode: vi.fn(() => false),
  mockGetReplicaPath: vi.fn(() => '/tmp/replica.db'),
  mockSyncViaUtilityProcess: vi.fn(() => Promise.resolve()),
  mockGetStoredCredentials: vi.fn<() => { tursoUrl: string; authToken: string } | null>(() => null),
  mockRecordSyncSuccess: vi.fn(),
  mockRecordSyncError: vi.fn(),
  mockIsOnline: vi.fn(() => true),
}));

vi.mock('../index', () => ({
  isReplicaMode: mockIsReplicaMode,
  getReplicaPath: mockGetReplicaPath,
  syncViaUtilityProcess: mockSyncViaUtilityProcess,
}));

vi.mock('../cloudSync', () => ({
  getStoredCredentials: mockGetStoredCredentials,
  recordSyncSuccess: mockRecordSyncSuccess,
  recordSyncError: mockRecordSyncError,
}));

vi.mock('electron', () => ({
  net: { isOnline: mockIsOnline },
}));

import {
  withSync,
  scheduleDebouncedSync,
  cancelPendingSync,
  startConnectivityPoller,
  stopConnectivityPoller,
  _resetForTest,
} from './index';

describe('scheduleDebouncedSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetForTest();
    vi.clearAllMocks();
    mockIsReplicaMode.mockReturnValue(true);
    mockGetStoredCredentials.mockReturnValue({ tursoUrl: 'libsql://x.io', authToken: 'token' });
    mockSyncViaUtilityProcess.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    _resetForTest();
    vi.useRealTimers();
  });

  it('does nothing when not in replica mode', () => {
    mockIsReplicaMode.mockReturnValue(false);
    scheduleDebouncedSync();
    vi.advanceTimersByTime(5_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });

  it('calls syncViaUtilityProcess with stored credentials after debounce window', async () => {
    scheduleDebouncedSync();
    vi.advanceTimersByTime(3_000);
    await vi.runAllTimersAsync();
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledWith(
      '/tmp/replica.db',
      'libsql://x.io',
      'token',
    );
  });

  it('does not sync when credentials are not stored', () => {
    mockGetStoredCredentials.mockReturnValue(null);
    scheduleDebouncedSync();
    vi.advanceTimersByTime(3_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });

  it('resets the timer on each call — multiple rapid calls result in one sync', async () => {
    scheduleDebouncedSync();
    vi.advanceTimersByTime(1_000);
    scheduleDebouncedSync();
    vi.advanceTimersByTime(1_000);
    scheduleDebouncedSync();
    vi.advanceTimersByTime(3_000);
    await vi.runAllTimersAsync();
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();
  });

  it('calls recordSyncSuccess after a successful sync', async () => {
    scheduleDebouncedSync();
    vi.advanceTimersByTime(3_000);
    await vi.runAllTimersAsync();
    expect(mockRecordSyncSuccess).toHaveBeenCalledOnce();
  });

  it('calls recordSyncError when sync rejects', async () => {
    mockSyncViaUtilityProcess.mockReturnValue(Promise.reject(new Error('network error')));
    scheduleDebouncedSync();
    vi.advanceTimersByTime(3_000);
    await vi.runAllTimersAsync();
    expect(mockRecordSyncError).toHaveBeenCalledWith('network error');
    expect(mockRecordSyncSuccess).not.toHaveBeenCalled();
  });
});

describe('cancelPendingSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetForTest();
    vi.clearAllMocks();
    mockIsReplicaMode.mockReturnValue(true);
    mockGetStoredCredentials.mockReturnValue({ tursoUrl: 'libsql://x.io', authToken: 'token' });
  });

  afterEach(() => {
    _resetForTest();
    vi.useRealTimers();
  });

  it('prevents a scheduled sync from firing', () => {
    scheduleDebouncedSync();
    cancelPendingSync();
    vi.advanceTimersByTime(5_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });
});

describe('startConnectivityPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetForTest();
    vi.clearAllMocks();
    mockIsReplicaMode.mockReturnValue(true);
    mockGetStoredCredentials.mockReturnValue({ tursoUrl: 'libsql://x.io', authToken: 'token' });
    mockSyncViaUtilityProcess.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    _resetForTest();
    vi.useRealTimers();
  });

  it('does not trigger sync when the connection remains online throughout', () => {
    mockIsOnline.mockReturnValue(true);
    startConnectivityPoller();
    vi.advanceTimersByTime(60_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });

  it('triggers a debounced sync when connectivity is regained after an offline period', async () => {
    mockIsOnline.mockReturnValue(false);
    startConnectivityPoller();
    vi.advanceTimersByTime(30_000);

    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(30_000);
    await vi.advanceTimersByTimeAsync(3_000);

    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();
  });

  it('triggers sync only once even if multiple online ticks follow the reconnect', async () => {
    mockIsOnline.mockReturnValue(false);
    startConnectivityPoller();
    vi.advanceTimersByTime(30_000);

    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(30_000);
    vi.advanceTimersByTime(30_000);
    await vi.advanceTimersByTimeAsync(3_000);

    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();
  });

  it('triggers a debounced sync on each reconnect across multiple offline/online cycles', async () => {
    mockIsOnline.mockReturnValue(false);
    startConnectivityPoller();
    vi.advanceTimersByTime(30_000);

    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(30_000);
    await vi.advanceTimersByTimeAsync(3_000);
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();

    mockIsOnline.mockReturnValue(false);
    vi.advanceTimersByTime(30_000);

    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(30_000);
    await vi.advanceTimersByTimeAsync(3_000);
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledTimes(2);
  });

  it('does not start a second poller when called twice', () => {
    startConnectivityPoller();
    startConnectivityPoller();
    expect(() => vi.advanceTimersByTime(30_000)).not.toThrow();
  });

  it('does not trigger sync when not in replica mode', () => {
    mockIsReplicaMode.mockReturnValue(false);
    mockIsOnline.mockReturnValue(false);
    startConnectivityPoller();
    vi.advanceTimersByTime(30_000);
    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(30_000 + 3_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });
});

describe('stopConnectivityPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetForTest();
    vi.clearAllMocks();
    mockIsReplicaMode.mockReturnValue(true);
    mockIsOnline.mockReturnValue(false);
  });

  afterEach(() => {
    _resetForTest();
    vi.useRealTimers();
  });

  it('prevents the poller from firing after stop', () => {
    startConnectivityPoller();
    stopConnectivityPoller();
    mockIsOnline.mockReturnValue(true);
    vi.advanceTimersByTime(60_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });
});

describe('withSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetForTest();
    vi.clearAllMocks();
    mockIsReplicaMode.mockReturnValue(true);
    mockGetStoredCredentials.mockReturnValue({ tursoUrl: 'libsql://x.io', authToken: 'token' });
    mockSyncViaUtilityProcess.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    _resetForTest();
    vi.useRealTimers();
  });

  it('returns the result of the operation', async () => {
    const result = await withSync(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('schedules a sync after the operation resolves', async () => {
    await withSync(() => Promise.resolve('ok'));
    vi.advanceTimersByTime(3_000);
    await vi.runAllTimersAsync();
    expect(mockSyncViaUtilityProcess).toHaveBeenCalledOnce();
  });

  it('does not schedule a sync when the operation rejects', async () => {
    await expect(withSync(() => Promise.reject(new Error('write failed')))).rejects.toThrow(
      'write failed',
    );
    vi.advanceTimersByTime(3_000);
    expect(mockSyncViaUtilityProcess).not.toHaveBeenCalled();
  });
});
