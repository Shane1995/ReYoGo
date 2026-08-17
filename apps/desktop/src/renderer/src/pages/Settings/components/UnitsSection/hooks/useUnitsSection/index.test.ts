import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/setup', () => ({
  setupService: {
    getUnits: vi.fn(),
    getArchivedUnits: vi.fn(),
    upsertUnit: vi.fn().mockResolvedValue(undefined),
    archiveUnit: vi.fn().mockResolvedValue(undefined),
    restoreUnit: vi.fn().mockResolvedValue(undefined),
    hardDeleteUnit: vi.fn().mockResolvedValue(undefined),
    getUnitUsageCount: vi.fn(),
  },
}));

import { useUnitsSection } from '.';
import { setupService } from '@/services/setup';

function mockUsageCounts(counts: Record<string, number>) {
  vi.mocked(setupService.getUnitUsageCount).mockImplementation((id: string) =>
    Promise.resolve(counts[id] ?? 0),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(setupService.getUnits).mockResolvedValue([
    { id: 'u1', name: 'Kilogram' },
    { id: 'u2', name: 'Litre' },
  ]);
  vi.mocked(setupService.getArchivedUnits).mockResolvedValue([]);
  mockUsageCounts({ u1: 3, u2: 0 });
});

describe('useUnitsSection', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useUnitsSection());
    expect(result.current.loading).toBe(true);
  });

  it('loads active units with their usage counts', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.units).toEqual([
      { id: 'u1', name: 'Kilogram', usageCount: 3 },
      { id: 'u2', name: 'Litre', usageCount: 0 },
    ]);
  });

  it('does not load archived units until toggled', async () => {
    renderHook(() => useUnitsSection());
    await waitFor(() => expect(setupService.getUnits).toHaveBeenCalled());
    expect(setupService.getArchivedUnits).not.toHaveBeenCalled();
  });

  it('loads archived units with usage counts when toggled on', async () => {
    vi.mocked(setupService.getArchivedUnits).mockResolvedValue([{ id: 'u3', name: 'Gram' }]);
    mockUsageCounts({ u1: 3, u2: 0, u3: 0 });
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.toggleShowArchived());

    await waitFor(() =>
      expect(result.current.archivedUnits).toEqual([{ id: 'u3', name: 'Gram', usageCount: 0 }]),
    );
    expect(result.current.showArchived).toBe(true);
  });

  it('adds a new unit and reloads the active list', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setAddName('Gram'));
    await act(() => result.current.handleAdd());

    expect(setupService.upsertUnit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Gram' }));
    expect(result.current.addName).toBe('');
  });

  it('rejects adding a duplicate name (case-insensitive) without calling the service', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setAddName('kilogram'));
    await act(() => result.current.handleAdd());

    expect(setupService.upsertUnit).not.toHaveBeenCalled();
  });

  it('rejects adding an empty/whitespace name without calling the service', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setAddName('   '));
    await act(() => result.current.handleAdd());

    expect(setupService.upsertUnit).not.toHaveBeenCalled();
  });

  it('renames a unit and reloads the active list', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.handleRename('u1', 'Kilo'));

    expect(setupService.upsertUnit).toHaveBeenCalledWith({ id: 'u1', name: 'Kilo' });
  });

  it('rejects renaming to a name already used by another unit', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.handleRename('u1', 'litre'));

    expect(setupService.upsertUnit).not.toHaveBeenCalled();
  });

  it('archives a unit and reloads the active list', async () => {
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.handleArchive('u2'));

    expect(setupService.archiveUnit).toHaveBeenCalledWith('u2');
  });

  it('restores an archived unit and reloads the archived list', async () => {
    vi.mocked(setupService.getArchivedUnits).mockResolvedValue([{ id: 'u3', name: 'Gram' }]);
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.toggleShowArchived());
    await waitFor(() => expect(result.current.archivedUnits).toHaveLength(1));

    await act(() => result.current.handleHardDelete('u3'));

    expect(setupService.hardDeleteUnit).toHaveBeenCalledWith('u3');
  });

  it('refuses to hard-delete a unit that still has usage, without calling the service', async () => {
    vi.mocked(setupService.getArchivedUnits).mockResolvedValue([{ id: 'u4', name: 'Ounce' }]);
    mockUsageCounts({ u1: 3, u2: 0, u4: 2 });
    const { result } = renderHook(() => useUnitsSection());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.toggleShowArchived());
    await waitFor(() => expect(result.current.archivedUnits).toHaveLength(1));

    await act(() => result.current.handleHardDelete('u4'));

    expect(setupService.hardDeleteUnit).not.toHaveBeenCalled();
  });
});
