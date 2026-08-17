import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/services/setup', () => ({
  setupService: {
    getUnits: vi.fn(),
    getArchivedUnits: vi.fn(),
    upsertUnit: vi.fn().mockResolvedValue(undefined),
    archiveUnit: vi.fn().mockResolvedValue(undefined),
    restoreUnit: vi.fn().mockResolvedValue(undefined),
    hardDeleteUnit: vi.fn().mockResolvedValue(undefined),
    getUnitUsageCount: vi.fn().mockResolvedValue(0),
  },
}));

import { UnitsSection } from '.';
import { setupService } from '@/services/setup';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(setupService.getUnits).mockResolvedValue([{ id: 'u1', name: 'Kilogram' }]);
  vi.mocked(setupService.getArchivedUnits).mockResolvedValue([]);
  vi.mocked(setupService.getUnitUsageCount).mockResolvedValue(0);
});

describe('UnitsSection', () => {
  it('lists active units once loaded', async () => {
    render(<UnitsSection />);
    await waitFor(() => expect(screen.getByText('Kilogram')).toBeDefined());
  });

  it('loads and shows archived units when the toggle is clicked', async () => {
    vi.mocked(setupService.getArchivedUnits).mockResolvedValue([{ id: 'u2', name: 'Gram' }]);
    render(<UnitsSection />);
    await waitFor(() => expect(screen.getByText('Kilogram')).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: /show archived/i }));

    await waitFor(() => expect(screen.getByText('Gram')).toBeDefined());
  });
});
