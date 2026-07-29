import { describe, it, expect } from 'vitest';
import { resolveScanView } from './index';

function makeFile() {
  return new File(['x'], 'invoice.png', { type: 'image/png' });
}

describe('resolveScanView', () => {
  it('returns loading while scanning', () => {
    expect(resolveScanView('scanning', makeFile(), 'blob:url')).toEqual({ kind: 'loading' });
  });

  it('returns preview when a file and preview URL are ready', () => {
    const file = makeFile();
    expect(resolveScanView('preview', file, 'blob:url')).toEqual({
      kind: 'preview',
      file,
      previewUrl: 'blob:url',
    });
  });

  it('falls back to upload when status is preview but the file is missing', () => {
    expect(resolveScanView('preview', null, 'blob:url')).toEqual({ kind: 'upload' });
  });

  it('falls back to upload when status is preview but the preview URL is missing', () => {
    expect(resolveScanView('preview', makeFile(), null)).toEqual({ kind: 'upload' });
  });

  it('returns upload for idle status', () => {
    expect(resolveScanView('idle', null, null)).toEqual({ kind: 'upload' });
  });

  it('returns upload for error status', () => {
    expect(resolveScanView('error', makeFile(), null)).toEqual({ kind: 'upload' });
  });
});
