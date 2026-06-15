import { describe, it, expect } from 'vitest';
import { draftLabelOf } from './index';

describe('draftLabelOf', () => {
  it('returns "Saving…" while saving', () => {
    expect(draftLabelOf(true)).toBe('Saving…');
  });

  it('returns "Save draft" otherwise', () => {
    expect(draftLabelOf(false)).toBe('Save draft');
  });
});
