import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxSection } from '.';
import type { IEntity } from '@reyogo/types';

vi.mock('@/services/entities', () => ({
  entitiesService: { updateEntityVat: vi.fn() },
}));

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

describe('TaxSection', () => {
  it('renders a single VAT rate input pre-filled from the first entity', () => {
    render(<TaxSection entities={entities} onSaved={vi.fn()} />);
    expect(screen.getByText(/VAT rate/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('15');
  });

  it('renders a Save button', () => {
    render(<TaxSection entities={entities} onSaved={vi.fn()} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});
