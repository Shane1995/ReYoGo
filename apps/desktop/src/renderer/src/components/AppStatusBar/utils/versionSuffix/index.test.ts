import { describe, it, expect } from 'vitest';
import { versionSuffix } from '.';

describe('versionSuffix', () => {
  it('returns empty string while syncing', () => {
    expect(versionSuffix(true, { version: '1.2.3' })).toBe('');
  });

  it('returns empty string when version is unknown', () => {
    expect(versionSuffix(false, null)).toBe('');
  });

  it('returns the formatted version suffix', () => {
    expect(versionSuffix(false, { version: '1.2.3' })).toBe(' · v1.2.3');
  });
});
