import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '.';

describe('SummaryCards', () => {
  it('renders the new and exists counts', () => {
    render(<SummaryCards selectedNew={3} existsCount={2} unresolvedCount={0} />);
    expect(screen.getByText('Will be added')).toBeInTheDocument();
    expect(screen.getByText('Already exist')).toBeInTheDocument();
    expect(screen.queryByText('Need a category')).not.toBeInTheDocument();
  });

  it('renders the unresolved card when there are unresolved items', () => {
    render(<SummaryCards selectedNew={3} existsCount={2} unresolvedCount={1} />);
    expect(screen.getByText('Need a category')).toBeInTheDocument();
  });
});
