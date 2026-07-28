import { safeStorage } from 'electron';
import { ANTHROPIC_API_KEY_PREFIX, ANTHROPIC_API_KEY_STORE_KEY } from './constants';
import { store } from './store';

export class SecureStorageUnavailableError extends Error {
  constructor() {
    super('Secure storage is not available on this system.');
    this.name = 'SecureStorageUnavailableError';
  }
}

export class InvalidApiKeyFormatError extends Error {
  constructor() {
    super(`Anthropic API keys must start with "${ANTHROPIC_API_KEY_PREFIX}".`);
    this.name = 'InvalidApiKeyFormatError';
  }
}

export function hasApiKey(): boolean {
  return !!store.get(ANTHROPIC_API_KEY_STORE_KEY);
}

export function getApiKey(): string | null {
  const encryptedB64 = store.get(ANTHROPIC_API_KEY_STORE_KEY);
  if (!encryptedB64) return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  return safeStorage.decryptString(Buffer.from(encryptedB64, 'base64'));
}

export function setApiKey(apiKey: string): void {
  if (!apiKey.startsWith(ANTHROPIC_API_KEY_PREFIX)) {
    throw new InvalidApiKeyFormatError();
  }
  if (!safeStorage.isEncryptionAvailable()) {
    throw new SecureStorageUnavailableError();
  }
  const encrypted = safeStorage.encryptString(apiKey);
  store.set(ANTHROPIC_API_KEY_STORE_KEY, encrypted.toString('base64'));
}

export function clearApiKey(): void {
  store.delete(ANTHROPIC_API_KEY_STORE_KEY);
}
