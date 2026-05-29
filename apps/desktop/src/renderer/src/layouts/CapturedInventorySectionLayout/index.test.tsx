import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AppConfigProvider } from '@/Context';
import { CapturedInventorySectionLayout } from './index';

function renderLayout() {
  return render(
    <AppConfigProvider>
      <MemoryRouter>
        <CapturedInventorySectionLayout />
      </MemoryRouter>
    </AppConfigProvider>,
  );
}

describe('CapturedInventorySectionLayout', () => {
  it('renders the Captured Inventory nav item', () => {
    renderLayout();
    expect(screen.getByText('Captured Inventory')).toBeInTheDocument();
  });

  it('renders all five stock section nav items', () => {
    renderLayout();
    expect(screen.getByText('Captured Inventory')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('renders the collapse button', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });
});
