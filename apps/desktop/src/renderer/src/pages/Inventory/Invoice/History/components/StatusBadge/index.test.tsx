import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceStatus } from '@reyogo/types';
import { StatusBadge } from '.';

describe('StatusBadge', () => {
  it('renders "Draft" for draft status', () => {
    render(<StatusBadge status={InvoiceStatus.Draft} />);
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders "Posted" for posted status', () => {
    render(<StatusBadge status={InvoiceStatus.Posted} />);
    expect(screen.getByText('Posted')).toBeDefined();
  });

  it('does not render "Posted" text for draft status', () => {
    render(<StatusBadge status={InvoiceStatus.Draft} />);
    expect(screen.queryByText('Posted')).toBeNull();
  });

  it('does not render "Draft" text for posted status', () => {
    render(<StatusBadge status={InvoiceStatus.Posted} />);
    expect(screen.queryByText('Draft')).toBeNull();
  });
});
