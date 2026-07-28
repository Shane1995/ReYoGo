import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAvailableOptionsSync } from '.';

describe('useAvailableOptionsSync', () => {
  it('reports available categories up on render', () => {
    const onAvailableCategoriesChange = vi.fn();
    renderHook(() =>
      useAvailableOptionsSync({
        availableCategories: ['Dairy'],
        availableTypes: [],
        onAvailableCategoriesChange,
        onAvailableTypesChange: vi.fn(),
      }),
    );
    expect(onAvailableCategoriesChange).toHaveBeenCalledWith(['Dairy']);
  });

  it('reports available types up on render', () => {
    const onAvailableTypesChange = vi.fn();
    renderHook(() =>
      useAvailableOptionsSync({
        availableCategories: [],
        availableTypes: ['food'],
        onAvailableCategoriesChange: vi.fn(),
        onAvailableTypesChange,
      }),
    );
    expect(onAvailableTypesChange).toHaveBeenCalledWith(['food']);
  });

  it('re-reports when the available lists change between renders', () => {
    const onAvailableCategoriesChange = vi.fn();
    const { rerender } = renderHook(
      (props) =>
        useAvailableOptionsSync({
          availableCategories: props.categories,
          availableTypes: [],
          onAvailableCategoriesChange,
          onAvailableTypesChange: vi.fn(),
        }),
      { initialProps: { categories: ['Dairy'] } },
    );
    rerender({ categories: ['Dairy', 'Beverages'] });
    expect(onAvailableCategoriesChange).toHaveBeenLastCalledWith(['Dairy', 'Beverages']);
  });
});
