import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import type { IEntity, IBusinessGroup } from '@reyogo/types';
import { entitiesService } from '@/services/entities';
import { EntityProvider, useEntities } from '.';

vi.mock('@/services/entities', () => ({
  entitiesService: {
    getEntities: vi.fn(),
    getGroup: vi.fn(),
  },
}));

const mockEntities: IEntity[] = [
  {
    id: 'e1',
    groupId: 'g1',
    name: 'The Crown Pub',
    defaultVatRate: 15,
    defaultVatMode: VatMode.Exclusive,
    archivedAt: null,
  },
];
const mockGroup: IBusinessGroup = { id: 'g1', name: 'The Crown Group' };

beforeEach(() => {
  vi.mocked(entitiesService.getEntities).mockResolvedValue(mockEntities);
  vi.mocked(entitiesService.getGroup).mockResolvedValue(mockGroup);
});

describe('EntityContext', () => {
  it('provides entities after mount', async () => {
    const { result } = renderHook(() => useEntities(), {
      wrapper: ({ children }) => <EntityProvider>{children}</EntityProvider>,
    });
    await act(async () => {});
    expect(result.current.entities).toHaveLength(1);
    expect(result.current.entities[0]!.name).toBe('The Crown Pub');
  });

  it('provides group after mount', async () => {
    const { result } = renderHook(() => useEntities(), {
      wrapper: ({ children }) => <EntityProvider>{children}</EntityProvider>,
    });
    await act(async () => {});
    expect(result.current.group?.name).toBe('The Crown Group');
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useEntities())).toThrow();
  });
});
