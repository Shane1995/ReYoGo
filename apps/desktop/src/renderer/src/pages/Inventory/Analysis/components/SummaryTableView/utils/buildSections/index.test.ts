import { describe, it, expect } from 'vitest';
import { buildSections } from './index';
import type { ItemGroup } from '../../../../types';

function makeGroup(overrides: Partial<ItemGroup> = {}): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Flour',
    categoryType: 'food',
    entries: [],
    ...overrides,
  };
}

describe('buildSections', () => {
  it('splits groups into sections by categoryType', () => {
    const groups = [
      makeGroup({ itemId: 'item-1', categoryType: 'food' }),
      makeGroup({ itemId: 'item-2', categoryType: 'beverage' }),
      makeGroup({ itemId: 'item-3', categoryType: 'food' }),
    ];

    const sections = buildSections(groups);
    const food = sections.find((s) => s.type === 'food');

    expect(food?.groups).toHaveLength(2);
    expect(food?.groups.map((g) => g.itemId)).toEqual(['item-1', 'item-3']);
  });

  it('orders sections according to TYPE_ORDER', () => {
    const groups = [
      makeGroup({ itemId: 'item-1', categoryType: 'non-food' }),
      makeGroup({ itemId: 'item-2', categoryType: 'food' }),
      makeGroup({ itemId: 'item-3', categoryType: 'beverage' }),
    ];

    const sections = buildSections(groups);

    expect(sections.map((s) => s.type)).toEqual(['food', 'beverage', 'non-food']);
  });

  it('appends unknown category types after the ordered sections', () => {
    const groups = [
      makeGroup({ itemId: 'item-1', categoryType: 'food' }),
      makeGroup({ itemId: 'item-2', categoryType: 'misc' }),
    ];

    const sections = buildSections(groups);

    expect(sections.map((s) => s.type)).toEqual(['food', 'misc']);
  });

  it('omits sections for category types that have no groups', () => {
    const groups = [makeGroup({ itemId: 'item-1', categoryType: 'beverage' })];

    const sections = buildSections(groups);

    expect(sections.map((s) => s.type)).toEqual(['beverage']);
  });
});
