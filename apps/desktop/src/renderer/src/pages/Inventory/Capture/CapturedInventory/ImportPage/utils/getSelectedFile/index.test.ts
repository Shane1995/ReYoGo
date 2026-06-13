import { describe, it, expect } from 'vitest';
import { getSelectedFile } from '.';

describe('getSelectedFile', () => {
  it('returns the first selected file', () => {
    const file = new File(['data'], 'inventory.xlsx');
    expect(getSelectedFile({ target: { files: [file] } })).toBe(file);
  });

  it('returns undefined when no file is selected', () => {
    expect(getSelectedFile({ target: { files: null } })).toBeUndefined();
  });

  it('returns undefined when the file list is empty', () => {
    expect(getSelectedFile({ target: { files: [] } })).toBeUndefined();
  });
});
