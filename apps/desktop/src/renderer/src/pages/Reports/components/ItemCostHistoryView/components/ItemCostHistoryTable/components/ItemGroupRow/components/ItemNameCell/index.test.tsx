import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemNameCell } from '.';

describe('ItemNameCell', () => {
  it('renders the item name', () => {
    render(<ItemNameCell name="300ml Coke" />);
    expect(screen.getByText('300ml Coke')).toBeInTheDocument();
  });

  it('appends the unit of measure when present', () => {
    render(<ItemNameCell name="300ml Coke" uom="each" />);
    expect(screen.getByText('/ each')).toBeInTheDocument();
  });

  it('omits the unit of measure when absent', () => {
    render(<ItemNameCell name="300ml Coke" />);
    expect(screen.queryByText('/', { exact: false })).not.toBeInTheDocument();
  });
});
