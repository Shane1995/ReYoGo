import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import { useLineManager } from './index';

describe('useLineManager', () => {
  it('initialises with one empty line', () => {
    const { result } = renderHook(() => useLineManager());
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]!.itemId).toBe('');
  });

  it('addLine appends a new line with a unique id', () => {
    const { result } = renderHook(() => useLineManager());
    const firstId = result.current.lines[0]!.id;
    act(() => {
      result.current.addLine();
    });
    expect(result.current.lines).toHaveLength(2);
    expect(result.current.lines[1]!.id).not.toBe(firstId);
  });

  it('removeLine removes the matching line', () => {
    const { result } = renderHook(() => useLineManager());
    act(() => {
      result.current.addLine();
    });
    const idToRemove = result.current.lines[0]!.id;
    act(() => {
      result.current.removeLine(idToRemove);
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]!.id).not.toBe(idToRemove);
  });

  it('removeLine resets to one empty line when the last line is removed', () => {
    const { result } = renderHook(() => useLineManager());
    const onlyId = result.current.lines[0]!.id;
    act(() => {
      result.current.removeLine(onlyId);
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]!.id).not.toBe(onlyId);
  });

  it('updateLine merges partial updates onto the target line', () => {
    const { result } = renderHook(() => useLineManager());
    const id = result.current.lines[0]!.id;
    act(() => {
      result.current.updateLine(id, { itemId: 'abc', quantity: 5 });
    });
    expect(result.current.lines[0]!.itemId).toBe('abc');
    expect(result.current.lines[0]!.quantity).toBe(5);
  });

  it('defaults isVatable to false when no vatMode provided', () => {
    const { result } = renderHook(() => useLineManager());
    expect(result.current.lines[0]!.isVatable).toBe(false);
  });

  it('defaults isVatable to true when vatMode is Exclusive', () => {
    const { result } = renderHook(() => useLineManager(undefined, VatMode.Exclusive));
    expect(result.current.lines[0]!.isVatable).toBe(true);
  });

  it('defaults isVatable to false when vatMode is Inclusive', () => {
    const { result } = renderHook(() => useLineManager(undefined, VatMode.Inclusive));
    expect(result.current.lines[0]!.isVatable).toBe(false);
  });

  it('addLine respects current vatMode for isVatable', () => {
    const { result } = renderHook(() => useLineManager(undefined, VatMode.Exclusive));
    act(() => result.current.addLine());
    expect(result.current.lines[1]!.isVatable).toBe(true);
  });
});
