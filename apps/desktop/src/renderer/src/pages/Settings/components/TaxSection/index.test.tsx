import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { TaxSection } from '.';
import { entitiesService } from '@/services/entities';
import { VatMode } from '@reyogo/types';
import type { IEntity } from '@reyogo/types';

vi.mock('@/services/entities', () => ({
  entitiesService: { updateEntityVat: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const entities: IEntity[] = [
  {
    id: 'e1',
    groupId: 'g1',
    name: 'Pub',
    defaultVatRate: 15,
    defaultVatMode: VatMode.Exclusive,
    archivedAt: null,
  },
  {
    id: 'e2',
    groupId: 'g1',
    name: 'Bar',
    defaultVatRate: 15,
    defaultVatMode: VatMode.Exclusive,
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

  it('shows an error toast when saving fails', async () => {
    vi.mocked(entitiesService.updateEntityVat).mockRejectedValue(new Error('boom'));
    render(<TaxSection entities={entities} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
