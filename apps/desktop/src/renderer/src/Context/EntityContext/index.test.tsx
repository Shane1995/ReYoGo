import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { IEntity, IBusinessGroup } from '@reyogo/types';
import { EntityProvider, useEntities } from '.';

const { mockEntities, mockGroup } = vi.hoisted(() => {
  const mockEntities: IEntity[] = [
    {
      id: 'e1',
      groupId: 'g1',
      name: 'The Crown Pub',
      defaultVatRate: 15,
      defaultVatMode: 'exclusive',
      archivedAt: null,
    },
  ];
  const mockGroup: IBusinessGroup = { id: 'g1', name: 'The Crown Group' };
  return { mockEntities, mockGroup };
});

vi.mock('@/services/entities', () => ({
  entitiesService: {
    getEntities: vi.fn().mockResolvedValue(mockEntities),
    getGroup: vi.fn().mockResolvedValue(mockGroup),
  },
}));

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
