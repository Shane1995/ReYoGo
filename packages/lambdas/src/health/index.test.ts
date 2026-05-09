import { describe, expect, it } from 'vitest';
import type { IInventoryItem } from '@reyogo/shared';
import { handler } from './index.js';

describe('health handler', () => {
  it('returns 200 with status ok', async () => {
    const result = await handler({} as never, {} as never, () => {});
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ status: 'ok' }) });
  });

  it('@reyogo/shared workspace types resolve', () => {
    const item: IInventoryItem = { id: 'a', name: 'b', categoryId: 'c', type: 'd' };
    expect(item.name).toBe('b');
  });
});
