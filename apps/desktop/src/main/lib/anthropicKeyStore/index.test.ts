import { describe, it, expect, vi, beforeEach } from 'vitest';

const { store } = vi.hoisted(() => {
  const store: Record<string, unknown> = {};
  return { store };
});

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/test-userdata') },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((s: string) => Buffer.from(`enc:${s}`)),
    decryptString: vi.fn((b: Buffer) => b.toString().replace('enc:', '')),
  },
}));

vi.mock('./store', () => ({
  store: {
    get: (key: string) => store[key],
    set: (key: string, val: unknown) => {
      store[key] = val;
    },
    delete: (key: string) => {
      delete store[key];
    },
  },
}));

import {
  hasApiKey,
  getApiKey,
  setApiKey,
  clearApiKey,
  InvalidApiKeyFormatError,
  SecureStorageUnavailableError,
} from './index';
import { safeStorage } from 'electron';

function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
  vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
}

describe('anthropicKeyStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('reports not configured when no key is stored', () => {
    expect(hasApiKey()).toBe(false);
    expect(getApiKey()).toBeNull();
  });

  it('stores and retrieves a valid key', () => {
    setApiKey('sk-ant-abc123');

    expect(hasApiKey()).toBe(true);
    expect(getApiKey()).toBe('sk-ant-abc123');
  });

  it('overwrites a previously stored key', () => {
    setApiKey('sk-ant-first');
    setApiKey('sk-ant-second');

    expect(getApiKey()).toBe('sk-ant-second');
  });

  it('clears a stored key', () => {
    setApiKey('sk-ant-abc123');

    clearApiKey();

    expect(hasApiKey()).toBe(false);
    expect(getApiKey()).toBeNull();
  });

  it('rejects a key without the sk-ant- prefix', () => {
    expect(() => setApiKey('not-a-real-key')).toThrow(InvalidApiKeyFormatError);
    expect(hasApiKey()).toBe(false);
  });

  it('throws when secure storage is unavailable on save', () => {
    vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

    expect(() => setApiKey('sk-ant-abc123')).toThrow(SecureStorageUnavailableError);
  });

  it('returns null when secure storage becomes unavailable after a key was saved', () => {
    setApiKey('sk-ant-abc123');
    vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

    expect(getApiKey()).toBeNull();
  });
});
