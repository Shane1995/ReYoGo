import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTableSort } from './index';

type Item = { id: string; name: string; value: number };

const data: Item[] = [
  { id: '1', name: 'Banana', value: 3 },
  { id: '2', name: 'Apple', value: 1 },
  { id: '3', name: 'Cherry', value: 2 },
];

const compareFns = {
  name: (a: Item, b: Item) => a.name.localeCompare(b.name),
  value: (a: Item, b: Item) => a.value - b.value,
};

describe('useTableSort', () => {
  it('returns original data when no sort active', () => {
    const { result } = renderHook(() => useTableSort(data, compareFns));
    expect(result.current.sortedData).toEqual(data);
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDir).toBeNull();
  });

  it('sorts ascending on first toggle', () => {
    const { result } = renderHook(() => useTableSort(data, compareFns));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDir).toBe('asc');
    expect(result.current.sortedData.map((d) => d.name)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('sorts descending on second toggle of same key', () => {
    const { result } = renderHook(() => useTableSort(data, compareFns));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.sortedData.map((d) => d.name)).toEqual(['Cherry', 'Banana', 'Apple']);
  });

  it('clears sort on third toggle of same key', () => {
    const { result } = renderHook(() => useTableSort(data, compareFns));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDir).toBeNull();
    expect(result.current.sortedData).toEqual(data);
  });

  it('resets to asc when switching to a different key', () => {
    const { result } = renderHook(() => useTableSort(data, compareFns));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('value'));
    expect(result.current.sortKey).toBe('value');
    expect(result.current.sortDir).toBe('asc');
    expect(result.current.sortedData.map((d) => d.value)).toEqual([1, 2, 3]);
  });

  it('does not mutate the original data array', () => {
    const originalOrder = data.map((d) => d.id);
    const { result } = renderHook(() => useTableSort(data, compareFns));
    act(() => result.current.toggleSort('name'));
    act(() => result.current.toggleSort('name'));
    expect(data.map((d) => d.id)).toEqual(originalOrder);
  });
});
