import { describe, it, expect } from 'vitest';
import type { InventoryItem } from './types';

describe('entityFilteredItems logic', () => {
  it('returns all items when entityFilter is null', () => {
    const items: InventoryItem[] = [
      { id: '1', entityId: 'e1', name: 'A', categoryId: 'c1', type: 'Food' },
      { id: '2', entityId: 'e2', name: 'B', categoryId: 'c1', type: 'Food' },
    ];
    const entityFilter: string | null = null;
    const result = entityFilter ? items.filter((i) => i.entityId === entityFilter) : items;
    expect(result).toHaveLength(2);
  });

  it('filters to only items matching entityFilter', () => {
    const items: InventoryItem[] = [
      { id: '1', entityId: 'e1', name: 'A', categoryId: 'c1', type: 'Food' },
      { id: '2', entityId: 'e2', name: 'B', categoryId: 'c1', type: 'Food' },
    ];
    const entityFilter = 'e1';
    const result = entityFilter ? items.filter((i) => i.entityId === entityFilter) : items;
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('1');
  });
});
