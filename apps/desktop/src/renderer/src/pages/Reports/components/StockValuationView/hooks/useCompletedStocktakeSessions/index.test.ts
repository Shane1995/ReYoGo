import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const getSessions = vi.fn();

vi.mock('@/services/stocktake', () => ({
  stocktakeService: {
    getSessions: () => getSessions(),
  },
}));

import { useCompletedStocktakeSessions } from '.';

beforeEach(() => {
  getSessions.mockReset();
  getSessions.mockResolvedValue([
    {
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'complete',
      completedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 's2',
      accountId: 'default',
      label: 'Week 2',
      status: 'open',
      completedAt: null,
      createdAt: new Date(),
    },
  ]);
});

describe('useCompletedStocktakeSessions', () => {
  it('returns only sessions with status complete', async () => {
    const { result } = renderHook(() => useCompletedStocktakeSessions());
    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0]!.id).toBe('s1');
  });
});
