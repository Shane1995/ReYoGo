import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InventoryType } from '@reyogo/types';
import { useImportReviewState } from '.';
import { UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '../../review';
import type { ReviewResult } from '../../review';

function makeInitial(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    units: [
      { name: 'litres', status: UNIT_STATUS.New, selected: true },
      { name: 'kgs', status: UNIT_STATUS.Exists, selected: false },
    ],
    categories: [
      {
        id: 'cat-new',
        name: 'Dairy',
        type: InventoryType.Food,
        status: CATEGORY_STATUS.New,
        selected: true,
        typeWarning: false,
      },
      {
        id: 'cat-exists',
        name: 'Beverages',
        type: InventoryType.Beverage,
        status: CATEGORY_STATUS.Exists,
        selected: false,
      },
      {
        id: 'cat-warn',
        name: 'Misc',
        type: 'unknown' as InventoryType,
        status: CATEGORY_STATUS.New,
        selected: true,
        typeWarning: true,
      },
    ],
    items: [
      {
        name: 'Milk',
        categoryName: 'Dairy',
        unit: 'litres',
        status: ITEM_STATUS.New,
        selected: true,
      },
      {
        name: 'Cola',
        categoryName: 'Beverages',
        unit: 'litres',
        status: ITEM_STATUS.Exists,
        selected: false,
      },
      {
        name: 'Bleach',
        categoryName: 'Cleaning',
        status: ITEM_STATUS.Unresolved,
        selected: false,
        unresolvedReason: 'Category not found: Cleaning',
      },
    ],
    parseErrors: [],
    availableCategories: [{ name: 'Dairy', type: InventoryType.Food }],
    counts: { newTotal: 3, existsTotal: 2, unresolvedTotal: 1 },
    ...overrides,
  };
}

describe('useImportReviewState', () => {
  it('computes typeWarningCount for new categories with an unrecognised type', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    expect(result.current.typeWarningCount).toBe(1);
  });

  it('computes selectedNew, existsCount, and unresolvedCount', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    expect(result.current.selectedNew).toBe(4); // litres unit + Dairy + Misc categories + Milk item
    expect(result.current.existsCount).toBe(3); // kgs unit + Beverages category + Cola item
    expect(result.current.unresolvedCount).toBe(1); // Bleach
  });

  it('fixCategoryType updates the type and clears the warning', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.fixCategoryType('cat-warn', InventoryType.NonFood));
    const cat = result.current.categories.find((c) => c.id === 'cat-warn');
    expect(cat).toMatchObject({ type: InventoryType.NonFood, typeWarning: false });
    expect(result.current.typeWarningCount).toBe(0);
  });

  it('toggleUnit flips selected for a new unit', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleUnit('litres'));
    expect(result.current.units.find((u) => u.name === 'litres')?.selected).toBe(false);
  });

  it('toggleUnit is a no-op for an existing unit', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleUnit('kgs'));
    expect(result.current.units.find((u) => u.name === 'kgs')?.selected).toBe(false);
  });

  it('toggleCategory flips selected for a new category', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleCategory('cat-new'));
    expect(result.current.categories.find((c) => c.id === 'cat-new')?.selected).toBe(false);
  });

  it('toggleCategory is a no-op for an existing category', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleCategory('cat-exists'));
    expect(result.current.categories.find((c) => c.id === 'cat-exists')?.selected).toBe(false);
  });

  it('toggleItem flips selected for a new item', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleItem('Milk'));
    expect(result.current.items.find((i) => i.name === 'Milk')?.selected).toBe(false);
  });

  it('toggleItem is a no-op for an existing or unresolved item', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.toggleItem('Cola'));
    act(() => result.current.toggleItem('Bleach'));
    expect(result.current.items.find((i) => i.name === 'Cola')?.selected).toBe(false);
    expect(result.current.items.find((i) => i.name === 'Bleach')?.selected).toBe(false);
  });

  it('assignCategory resolves an unresolved item to a new category', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.assignCategory('Bleach', 'Cleaning Supplies'));
    expect(result.current.items.find((i) => i.name === 'Bleach')).toMatchObject({
      categoryName: 'Cleaning Supplies',
      status: ITEM_STATUS.New,
      selected: true,
    });
  });

  it('assignCategory clears an assignment back to unresolved', () => {
    const { result } = renderHook(() => useImportReviewState(makeInitial()));
    act(() => result.current.assignCategory('Bleach', 'Cleaning Supplies'));
    act(() => result.current.assignCategory('Bleach', ''));
    expect(result.current.items.find((i) => i.name === 'Bleach')).toMatchObject({
      categoryName: 'Category not found: Cleaning',
      status: ITEM_STATUS.Unresolved,
      selected: false,
    });
  });

  it('buildResult returns the current state plus original metadata', () => {
    const initial = makeInitial();
    const { result } = renderHook(() => useImportReviewState(initial));
    act(() => result.current.toggleUnit('litres'));
    const built = result.current.buildResult();
    expect(built.units).toEqual(result.current.units);
    expect(built.parseErrors).toBe(initial.parseErrors);
    expect(built.availableCategories).toBe(initial.availableCategories);
    expect(built.counts).toBe(initial.counts);
  });
});
