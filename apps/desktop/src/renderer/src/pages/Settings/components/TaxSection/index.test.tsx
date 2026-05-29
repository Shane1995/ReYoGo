import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxSection } from '.';
import type { IEntity } from '@reyogo/types';

vi.mock('@/services/entities', () => ({
  entitiesService: { updateEntityVat: vi.fn() },
}));

describe('TaxSection', () => {
  it('renders one row per entity', () => {
    const entities: IEntity[] = [
      {
        id: 'e1',
        groupId: 'g1',
        name: 'Pub',
        defaultVatRate: 15,
        defaultVatMode: 'exclusive',
        archivedAt: null,
      },
      {
        id: 'e2',
        groupId: 'g1',
        name: 'Bar',
        defaultVatRate: 15,
        defaultVatMode: 'exclusive',
        archivedAt: null,
      },
    ];
    render(<TaxSection entities={entities} onSaved={vi.fn()} />);
    expect(screen.getByText('Pub')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });
});
