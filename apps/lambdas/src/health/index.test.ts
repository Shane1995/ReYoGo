import { describe, expect, it } from 'vitest';
import { InventoryType } from '@reyogo/types';
import type { IInventoryItem } from '@reyogo/types';
import { handler } from './index.js';

describe('health handler', () => {
  it('returns 200 with status ok', async () => {
    const result = await handler({} as never, {} as never, () => {});
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ status: 'ok' }) });
  });

  it('@reyogo/types workspace types resolve', () => {
    const item: IInventoryItem = { id: 'a', name: 'b', categoryId: 'c', type: InventoryType.Food };
    expect(item.name).toBe('b');
  });
});
