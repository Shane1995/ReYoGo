import { describe, it, expect } from 'vitest';
import { unresolvedItemsMessage } from '.';

describe('unresolvedItemsMessage', () => {
  it('uses singular phrasing for a single item', () => {
    expect(unresolvedItemsMessage(1)).toBe("1 item has a category that wasn't found.");
  });

  it('uses plural phrasing for multiple items', () => {
    expect(unresolvedItemsMessage(3)).toBe("3 items have a category that wasn't found.");
  });
});
