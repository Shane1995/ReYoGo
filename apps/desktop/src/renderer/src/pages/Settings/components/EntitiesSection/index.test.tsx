import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { EntitiesSection } from '.';
import { entitiesService } from '@/services/entities';
import { VatMode } from '@reyogo/types';
import type { IEntity } from '@reyogo/types';

vi.mock('@/services/entities', () => ({
  entitiesService: {
    createEntity: vi.fn(),
    renameEntity: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
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

describe('EntitiesSection', () => {
  it('renders entity list', () => {
    render(<EntitiesSection entities={mockEntities} onSaved={vi.fn()} />);
    expect(screen.getByText('The Crown Pub')).toBeInTheDocument();
  });

  it('calls createEntity and onSaved when adding', async () => {
    vi.mocked(entitiesService.createEntity).mockResolvedValue([]);
    const onSaved = vi.fn().mockResolvedValue(undefined);
    render(<EntitiesSection entities={mockEntities} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /add business/i }));
    fireEvent.change(screen.getByPlaceholderText(/new business name/i), {
      target: { value: 'Gin on Tap' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => expect(entitiesService.createEntity).toHaveBeenCalledWith('Gin on Tap'));
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows an error toast when adding a business fails', async () => {
    vi.mocked(entitiesService.createEntity).mockRejectedValue(new Error('boom'));
    render(<EntitiesSection entities={mockEntities} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /add business/i }));
    fireEvent.change(screen.getByPlaceholderText(/new business name/i), {
      target: { value: 'Gin on Tap' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows an error toast when renaming an entity fails', async () => {
    vi.mocked(entitiesService.renameEntity).mockRejectedValue(new Error('boom'));
    render(<EntitiesSection entities={mockEntities} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /rename/i }));
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
