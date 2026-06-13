import { describe, it, expect } from 'vitest';
import { hintFor } from '.';

describe('hintFor', () => {
  it('returns a migration hint for NOT NULL constraint errors', () => {
    expect(hintFor('NOT NULL constraint failed: foo.bar')).toContain('schema update failed');
  });

  it('returns a migration hint for "cannot add a not null column" errors', () => {
    expect(hintFor('cannot add a not null column')).toContain('schema update failed');
  });

  it('returns a migration hint for generic migration errors', () => {
    expect(hintFor('migration 0007 failed')).toContain('schema update failed');
  });

  it('returns a cloud-sync hint for OneDrive errors', () => {
    expect(hintFor('EPERM: operation not permitted, open OneDrive/app.db')).toContain('OneDrive');
  });

  it('returns a cloud-sync hint for read-only filesystem errors', () => {
    expect(hintFor('EROFS: read-only file system')).toContain('OneDrive');
  });

  it('returns a generic hint for unrecognised errors', () => {
    expect(hintFor('something went wrong')).toBe(
      'Try relaunching the app. If the problem persists, reinstall or contact support.',
    );
  });
});
