import { describe, it, expect } from 'vitest';
import { postLabelOf } from './index';

describe('postLabelOf', () => {
  it('returns "Posting…" while saving', () => {
    expect(postLabelOf(true)).toBe('Posting…');
  });

  it('returns "Post invoice" otherwise', () => {
    expect(postLabelOf(false)).toBe('Post invoice');
  });
});
