import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '.';
import { InvoiceStatus } from '@reyogo/types';

describe('StatusBadge', () => {
  it('renders Posted badge', () => {
    render(<StatusBadge status={InvoiceStatus.Posted} />);
    expect(screen.getByText('Posted')).toBeDefined();
  });

  it('renders Draft badge', () => {
    render(<StatusBadge status={InvoiceStatus.Draft} />);
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders Credit Note badge', () => {
    render(<StatusBadge status={InvoiceStatus.CreditNote} />);
    expect(screen.getByText('Credit Note')).toBeDefined();
  });
});
