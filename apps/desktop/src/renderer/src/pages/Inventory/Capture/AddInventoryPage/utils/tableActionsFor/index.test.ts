import { describe, it, expect, vi } from 'vitest';
import { tableActionsFor } from '.';
import type { ItemRows, CategoryRows } from '../../types';

function buildItemRows(overrides: Partial<ItemRows> = {}): ItemRows {
  return {
    itemRows: [],
    itemDupes: new Set(),
    canSubmitItems: false,
    hasIncompleteItemRows: false,
    addItemRow: vi.fn(),
    removeItemRow: vi.fn(),
    updateItemRow: vi.fn(),
    submitItems: vi.fn(),
    clearItemRows: vi.fn(),
    ...overrides,
  };
}

function buildCategoryRows(overrides: Partial<CategoryRows> = {}): CategoryRows {
  return {
    catRows: [],
    catDupes: new Set(),
    canSubmitCats: false,
    addCatRow: vi.fn(),
    removeCatRow: vi.fn(),
    updateCatRow: vi.fn(),
    submitCats: vi.fn(),
    clearCatRows: vi.fn(),
    ...overrides,
  };
}

describe('tableActionsFor', () => {
  it('returns item row actions for items mode', () => {
    const itemRows = buildItemRows();
    const catRows = buildCategoryRows();

    const actions = tableActionsFor('items', itemRows, catRows);

    expect(actions.onAddRow).toBe(itemRows.addItemRow);
    expect(actions.onClear).toBe(itemRows.clearItemRows);
    expect(actions.onSubmit).toBe(itemRows.submitItems);
  });

  it('returns category row actions for categories mode', () => {
    const itemRows = buildItemRows();
    const catRows = buildCategoryRows();

    const actions = tableActionsFor('categories', itemRows, catRows);

    expect(actions.onAddRow).toBe(catRows.addCatRow);
    expect(actions.onClear).toBe(catRows.clearCatRows);
    expect(actions.onSubmit).toBe(catRows.submitCats);
  });
});
