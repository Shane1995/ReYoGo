import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollapsedCategories } from '.';

describe('useCollapsedCategories', () => {
  it('starts with every category expanded', () => {
    const { result } = renderHook(() => useCollapsedCategories());
    expect(result.current.isExpanded('Dairy')).toBe(true);
  });

  it('collapses a category on toggle', () => {
    const { result } = renderHook(() => useCollapsedCategories());
    act(() => result.current.toggleCategory('Dairy'));
    expect(result.current.isExpanded('Dairy')).toBe(false);
  });

  it('expands a collapsed category on a second toggle', () => {
    const { result } = renderHook(() => useCollapsedCategories());
    act(() => result.current.toggleCategory('Dairy'));
    act(() => result.current.toggleCategory('Dairy'));
    expect(result.current.isExpanded('Dairy')).toBe(true);
  });
});
