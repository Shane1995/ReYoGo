import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BusinessSection } from '.';
import { entitiesService } from '@/services/entities';

vi.mock('@/services/entities', () => ({
  entitiesService: {
    updateGroupName: vi.fn(),
  },
}));

const mockGroup = { id: 'g1', name: 'The Crown Group' };

describe('BusinessSection', () => {
  it('shows current group name in input', () => {
    render(<BusinessSection group={mockGroup} onSaved={vi.fn()} />);
    expect(screen.getByDisplayValue('The Crown Group')).toBeInTheDocument();
  });

  it('calls updateGroupName and onSaved on save', async () => {
    vi.mocked(entitiesService.updateGroupName).mockResolvedValue(undefined);
    const onSaved = vi.fn().mockResolvedValue(undefined);
    render(<BusinessSection group={mockGroup} onSaved={onSaved} />);
    fireEvent.change(screen.getByDisplayValue('The Crown Group'), {
      target: { value: 'New Name' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(entitiesService.updateGroupName).toHaveBeenCalledWith('New Name'));
    expect(onSaved).toHaveBeenCalled();
  });
});
