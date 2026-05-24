import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { PackageIcon, ReceiptIcon } from 'lucide-react';
import { SectionLayout } from './index';

const navItems = [
  { label: 'Stock', path: '/stock', icon: PackageIcon, end: true },
  { label: 'Invoices', path: '/invoices', icon: ReceiptIcon, end: false },
] as const;

function renderLayout(storageKey?: string) {
  return render(
    <MemoryRouter>
      <SectionLayout navItems={navItems} storageKey={storageKey} />
    </MemoryRouter>,
  );
}

describe('SectionLayout', () => {
  beforeEach(() => localStorage.clear());

  it('renders all nav item labels when expanded', () => {
    renderLayout();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('shows the Collapse button when expanded', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });

  it('hides nav labels after collapsing', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await waitFor(() => {
      expect(screen.queryByText('Stock')).not.toBeInTheDocument();
      expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
    });
  });

  it('shows the Expand button after collapsing', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('persists collapsed state to localStorage', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(localStorage.getItem('sidebar-section-collapsed')).toBe('true');
  });

  it('restores collapsed state from localStorage on mount', () => {
    localStorage.setItem('sidebar-section-collapsed', 'true');
    renderLayout();
    expect(screen.queryByText('Stock')).not.toBeInTheDocument();
  });

  it('writes to a custom storageKey when provided', async () => {
    renderLayout('my-section-key');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(localStorage.getItem('my-section-key')).toBe('true');
  });

  it('renders children instead of Outlet when provided', () => {
    render(
      <MemoryRouter>
        <SectionLayout navItems={navItems}>
          <div>Custom content</div>
        </SectionLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});
