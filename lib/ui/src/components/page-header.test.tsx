import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<PageHeader title="Stock" description="Manage your inventory" />);
    expect(screen.getByText('Manage your inventory')).toBeInTheDocument();
  });

  it('does not render a description element when omitted', () => {
    render(<PageHeader title="Stock" />);
    expect(screen.queryByText(/Manage/)).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<PageHeader title="Stock" actions={<button>Add item</button>} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });
});
