import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/stocktake', () => ({
  stocktakeService: {
    createSession: vi.fn(),
    getSessions: vi.fn(),
    getSession: vi.fn(),
    saveDraftLines: vi.fn().mockResolvedValue(undefined),
    completeSession: vi.fn().mockResolvedValue(undefined),
  },
}));

import { useStocktakeSession } from '.';
import { stocktakeService } from '@/services/stocktake';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(stocktakeService.getSessions).mockResolvedValue([
    {
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
    },
  ]);
});

describe('useStocktakeSession', () => {
  it('loads sessions on mount', async () => {
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));
    expect(result.current.sessions).toHaveLength(1);
  });

  it('creates a session and selects it as current', async () => {
    vi.mocked(stocktakeService.createSession).mockResolvedValue({
      id: 's2',
      accountId: 'default',
      label: 'New',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
    });
    vi.mocked(stocktakeService.getSession).mockResolvedValue({
      id: 's2',
      accountId: 'default',
      label: 'New',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
      lines: [],
    });
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));

    await act(() => result.current.createSession('New'));

    expect(stocktakeService.createSession).toHaveBeenCalledWith('New');
    expect(result.current.currentSession?.id).toBe('s2');
  });

  it('selects an existing session by id', async () => {
    vi.mocked(stocktakeService.getSession).mockResolvedValue({
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
      lines: [{ id: 'l1', sessionId: 's1', inventoryItemId: 'item-1', countedQty: 5, notes: null }],
    });
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));

    await act(() => result.current.selectSession('s1'));

    expect(result.current.currentSession?.lines).toHaveLength(1);
  });

  it('saves draft lines for the current session', async () => {
    vi.mocked(stocktakeService.getSession).mockResolvedValue({
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
      lines: [],
    });
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));
    await act(() => result.current.selectSession('s1'));

    const lines = [{ id: 'l1', inventoryItemId: 'item-1', countedQty: 3 }];
    await act(() => result.current.saveDraft(lines));

    expect(stocktakeService.saveDraftLines).toHaveBeenCalledWith('s1', lines);
  });

  it('completes the current session', async () => {
    vi.mocked(stocktakeService.getSession).mockResolvedValue({
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
      lines: [],
    });
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));
    await act(() => result.current.selectSession('s1'));

    const lines = [{ id: 'l1', inventoryItemId: 'item-1', countedQty: 3 }];
    await act(() => result.current.complete(lines));

    expect(stocktakeService.completeSession).toHaveBeenCalledWith('s1', lines);
  });

  it('does nothing when saving a draft with no current session selected', async () => {
    const { result } = renderHook(() => useStocktakeSession());
    await waitFor(() => expect(result.current.loadingSessions).toBe(false));

    await act(() => result.current.saveDraft([]));

    expect(stocktakeService.saveDraftLines).not.toHaveBeenCalled();
  });
});
