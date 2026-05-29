import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntitiesSection } from '.';
import { entitiesService } from '@/services/entities';
import type { IEntity } from '@reyogo/types';

vi.mock('@/services/entities', () => ({
  entitiesService: {
    createEntity: vi.fn(),
    renameEntity: vi.fn(),
  },
}));

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

describe('EntitiesSection', () => {
  it('renders entity list', () => {
    render(<EntitiesSection entities={mockEntities} onSaved={vi.fn()} />);
    expect(screen.getByText('The Crown Pub')).toBeInTheDocument();
  });

  it('calls createEntity and onSaved when adding', async () => {
    vi.mocked(entitiesService.createEntity).mockResolvedValue([]);
    const onSaved = vi.fn().mockResolvedValue(undefined);
    render(<EntitiesSection entities={mockEntities} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /add entity/i }));
    fireEvent.change(screen.getByPlaceholderText(/new entity name/i), {
      target: { value: 'Gin on Tap' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => expect(entitiesService.createEntity).toHaveBeenCalledWith('Gin on Tap'));
    expect(onSaved).toHaveBeenCalled();
  });
});
